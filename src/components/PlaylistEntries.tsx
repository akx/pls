import React from 'react';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import reverse from 'lodash/reverse';
import toPairs from 'lodash/toPairs';
import map from 'lodash/map';
import update from 'immutability-helper';

import RequestStatus from './RequestStatus';
import SortAndFilterForm from './SortAndFilterForm';

import TrackDetailsService, { AudioFeatureMap } from '../services/AudioFeaturesService';
import { DETAILS_FIELDS, QUANTIFIABLE_NUMERIC_FIELDS } from '../consts';
import { formatDuration, formatTitle } from '../utils/format';
import { Playlist, PlaylistEntry } from '../types/spotify';
import { AugmentedPlaylistEntry } from '../types/pls';
import Request from '../utils/request';
import { downloadBlob } from '../utils/blobs';
import { NumberLimits } from './types';
import PlaylistEntriesTableRow from './PlaylistEntriesTableRow';
import { createPlaylistWithTracks, getPlaylistEntries, PlaylistEntriesRequest } from '../spotifyApi/playlists';

function makeAugmentedPlaylistEntry(playlistEntry: PlaylistEntry): AugmentedPlaylistEntry {
  return {
    ...playlistEntry,
    ...playlistEntry.track,
    ...(TrackDetailsService.getDetails(playlistEntry.track.id) || {}),
    artistName: playlistEntry.track.artists.map(a => a.name).join(', '),
    albumName: playlistEntry.track.album.name,
  };
}

function calculateNumberLimits(entries: AugmentedPlaylistEntry[]) {
  const limits: NumberLimits = {};
  QUANTIFIABLE_NUMERIC_FIELDS.forEach(field => {
    const values = map(entries, field);
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    limits[field] = [min, max];
  });
  return limits;
}

interface PlaylistEntriesProps {
  playlist: Playlist;
}

interface PlaylistEntriesState {
  playlistEntriesRequest: PlaylistEntriesRequest | null;
  trackDetailsRequest: Request<AudioFeatureMap> | null;
  playlistEntries?: PlaylistEntry[];
  sort: string;
  reverse: boolean;
  filters: { [key: string]: string };
  colorize: boolean;
}

export default class PlaylistEntries extends React.Component<PlaylistEntriesProps, PlaylistEntriesState> {
  public readonly state: PlaylistEntriesState = {
    playlistEntriesRequest: null,
    trackDetailsRequest: null,
    sort: 'original',
    reverse: false,
    filters: {},
    colorize: false,
  };

  public componentDidMount() {
    this.loadPlaylistEntries();
  }

  private loadPlaylistEntries() {
    const { playlist } = this.props;
    const playlistEntriesRequest = getPlaylistEntries(playlist.owner.id, playlist.id);

    playlistEntriesRequest.onProgress.push(() => {
      this.forceUpdate();
    });
    playlistEntriesRequest.onComplete.push(playlistEntries => {
      this.setState({ playlistEntries });
      this.loadTrackDetails();
    });
    this.setState({ playlistEntriesRequest });
  }

  private loadTrackDetails() {
    const trackIds = (this.state.playlistEntries || []).map(ple => ple.track.id);
    if (!trackIds.length) return;
    const trackDetailsRequest = TrackDetailsService.ensureLoaded(trackIds);

    trackDetailsRequest.onProgress.push(() => {
      this.forceUpdate();
    });
    trackDetailsRequest.onComplete.push(tdMap => {
      this.setState({ trackDetailsRequest: null });
    });
    this.setState({ trackDetailsRequest });
  }

  private createNewPlaylist(entries: readonly AugmentedPlaylistEntry[]) {
    const spotifyUris = entries.map(ent => ent.uri).filter(uri => uri);
    if (!spotifyUris.length) {
      alert('No tracks to create a playlist from.');
      return false;
    }
    const title = prompt('What should the new playlist be called?');
    if (!title) {
      return false;
    }
    return createPlaylistWithTracks(title, spotifyUris)
      .then(() => {
        alert('Playlist successfully created. :)');
      })
      .catch(err => {
        console.error(err);
        alert(`Error creating playlist: ${err}`);
      });
  }

  downloadEntriesJSON(playlistEntries: readonly AugmentedPlaylistEntry[]) {
    const { playlist } = this.props;
    const jsonData = JSON.stringify(playlistEntries, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const name = `pls-${playlist.name}.json`;
    downloadBlob(blob, name);
  }

  private sortAndFilterEntries(playlistEntries: readonly PlaylistEntry[]): AugmentedPlaylistEntry[] {
    const filterPairs = toPairs(this.state.filters).filter(([, value]) => value !== '');
    const filterEntry = (entry: AugmentedPlaylistEntry) =>
      filterPairs.every(([key, value]) => {
        const [field, op] = key.split(':');

        let filterValue: string | number = value;
        if (op === 'gte' || op === 'lte') {
          filterValue = parseFloat(filterValue);
          if (Number.isNaN(filterValue)) return true;
        }
        const objectValue = entry[field as keyof AugmentedPlaylistEntry];
        if (objectValue === undefined || objectValue === null) return false;
        if (op === 'gte') return objectValue >= filterValue;
        if (op === 'lte') return objectValue <= filterValue;
        if (op === 'contains') return objectValue.toString().includes(filterValue.toString());
        console.warn(key, field, op, value);
        return true;
      });
    let entries = (playlistEntries || []).map(makeAugmentedPlaylistEntry).filter(filterEntry);
    if (this.state.sort !== 'original') {
      const sortKey = this.state.sort;
      entries = sortBy(entries, entry => get(entry, sortKey));
    }
    if (this.state.reverse) {
      entries = reverse(entries);
    }
    return entries;
  }

  render() {
    const { playlistEntries, playlistEntriesRequest, trackDetailsRequest, colorize } = this.state;
    if (!playlistEntriesRequest) return null;
    if (!playlistEntriesRequest.result) {
      return (
        <RequestStatus
          request={playlistEntriesRequest}
          progressMessage="Loading playlist entries..."
          errorMessage="Oops, an error occurred loading these entries."
          retry={() => this.loadPlaylistEntries()}
        />
      );
    }
    let detailsStatus;
    if (trackDetailsRequest) {
      detailsStatus = (
        <RequestStatus
          request={trackDetailsRequest}
          progressMessage="Loading track analysis..."
          retry={() => this.loadTrackDetails()}
        />
      );
    }
    if (!playlistEntries) {
      return null;
    }
    const entries = this.sortAndFilterEntries(playlistEntries);
    const numberLimits = colorize ? calculateNumberLimits(entries) : {};

    return (
      <div>
        {detailsStatus}
        <SortAndFilterForm
          sort={this.state.sort}
          reverse={this.state.reverse}
          filters={this.state.filters}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          setSort={(key, reverse) => this.setState({ sort: key, reverse })}
          setFilterValue={(key, value) => {
            const updateCommand = value === '' ? { $unset: [key] } : { [key]: { $set: value } };
            const newFilters = update(this.state.filters, updateCommand);
            return this.setState({ filters: newFilters });
          }}
        />
        <fieldset className="tools">
          <legend>Tools</legend>
          <button disabled={entries.length === 0} onClick={() => this.createNewPlaylist(entries)}>
            Create New Playlist of {entries.length} Tracks
          </button>
          <button disabled={entries.length === 0} onClick={() => this.downloadEntriesJSON(entries)}>
            Export JSON Track Data
          </button>
          <label>
            <input type="checkbox" checked={colorize} onChange={e => this.setState({ colorize: e.target.checked })} />
            Colorize Numbers
          </label>
        </fieldset>
        <table className="visual-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Artist</th>
              <th>Track</th>
              <th>Album</th>
              <th>Duration</th>
              {DETAILS_FIELDS.map(f => (
                <th key={f}>{formatTitle(f)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <PlaylistEntriesTableRow
                entry={entry}
                key={entry.originalIndex}
                colorize={colorize}
                numberLimits={numberLimits}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
