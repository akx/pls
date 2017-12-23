/* eslint-disable no-alert,no-console,no-underscore-dangle */
import React from 'react';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import reverse from 'lodash/reverse';
import toPairs from 'lodash/toPairs';
import update from 'immutability-helper';

import RequestStatus from './RequestStatus';
import SortAndFilterForm from './SortAndFilterForm';

import TrackDetailsService from '../services/TrackDetailsService';
import { createPlaylistWithTracks, getPlaylistEntries } from '../spotifyApi';
import { DETAILS_FIELDS } from '../consts';
import { formatDuration, formatTitle } from '../utils/format';


function augmentPlaylistEntryWithMerged(playlistEntry) {
  const merged = Object.assign(
    {},
    playlistEntry,
    playlistEntry.track,
    TrackDetailsService.getDetails(playlistEntry.track.id) || {},
  );
  delete merged.track;
  merged.artistName = merged.artists.map(a => a.name).join(', ');
  merged.albumName = get(merged, 'album.name');
  return Object.assign({ _merged: merged }, playlistEntry);
}

export default class PlaylistEntries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playlistEntriesRequest: null,
      trackDetailsRequest: null,
      sort: 'original',
      reverse: false,
      filters: {},
    };
  }

  componentDidMount() {
    this.loadPlaylistEntries();
  }

  loadPlaylistEntries() {
    const { playlist } = this.props;
    const playlistEntriesRequest = getPlaylistEntries(playlist.owner.id, playlist.id);

    playlistEntriesRequest.onProgress.push(() => {
      this.forceUpdate();
    });
    playlistEntriesRequest.then((playlistEntries) => {
      this.setState({ playlistEntries });
      this.loadTrackDetails();
    });
    this.setState({ playlistEntriesRequest });
  }

  loadTrackDetails() {
    const trackIds = this.state.playlistEntries.map(ple => ple.track.id);
    if (!trackIds.length) return;
    const trackDetailsRequest = TrackDetailsService.ensureLoaded(trackIds);

    trackDetailsRequest.onProgress.push(() => {
      this.forceUpdate();
    });
    trackDetailsRequest.then(() => {
      this.setState({ trackDetailsRequest: null });
    });
    this.setState({ trackDetailsRequest });
  }

  // eslint-disable-next-line class-methods-use-this
  createNewPlaylist(tracks) {
    const title = prompt('What should the new playlist be called?');
    if (!title) {
      return false;
    }
    const spotifyUris = tracks.map(track => track.uri).filter(uri => uri);
    return createPlaylistWithTracks(title, spotifyUris)
      .then(() => {
        alert('Playlist successfully created. :)');
      })
      .catch((err) => {
        console.error(err);
        alert(`Error creating playlist: ${err}`);
      });
  }

  downloadEntriesJSON(playlistEntries) {
    const { playlist } = this.props;
    const jsonData = JSON.stringify(playlistEntries.map((ple) => {
      const copy = Object.assign({}, ple);
      delete copy._merged;
      return copy;
    }), null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = Object.assign(document.createElement('a'), {
      href: url,
      download: `pls-${playlist.name}.json`,
    });
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
      downloadLink.parentNode.removeChild(downloadLink);
    }, 500);
  }

  sortAndFilterEntries(playlistEntries) {
    const filterPairs = toPairs(this.state.filters).filter(([, value]) => value !== '');
    const filterEntry = entry => (
      filterPairs.every(([key, value]) => {
        const [field, op] = key.split(':');

        let filterValue = value;
        if(op === 'gte' || op === 'lte') {
          filterValue = parseFloat(filterValue);
          if (Number.isNaN(filterValue)) return true;
        }
        const objectValue = entry._merged[field];
        if (objectValue === undefined) return false;
        if (op === 'gte') return objectValue >= filterValue;
        if (op === 'lte') return objectValue <= filterValue;
        if (op === 'contains') return objectValue.toString().includes(filterValue);
        console.warn(key, field, op, value);
        return true;
      })
    );
    let entries = (playlistEntries || []).map(augmentPlaylistEntryWithMerged).filter(filterEntry);
    if (this.state.sort !== 'original') {
      const sortKey = this.state.sort;
      entries = sortBy(entries, entry => get(entry._merged, sortKey));
    }
    if (this.state.reverse) {
      entries = reverse(entries);
    }
    return entries;
  }

  render() {
    const { playlistEntries, playlistEntriesRequest, trackDetailsRequest } = this.state;
    if (!playlistEntriesRequest) return null;
    if (!playlistEntriesRequest.result) {
      return (
        <RequestStatus
          request={playlistEntriesRequest}
          progressMessage="Loading playlist entries..."
          errorMessage="Oops, an error occurred loading these entries."
          retry={() => this.loadData()}
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
    const entries = this.sortAndFilterEntries(playlistEntries);

    return (
      <div>
        {detailsStatus}
        <SortAndFilterForm
          sort={this.state.sort}
          reverse={this.state.reverse}
          filters={this.state.filters}
          setValue={(key, value) => this.setState({ [key]: value })}
          setFilterValue={(key, value) => {
            const updateCommand = (value === '' ? { $unset: [key] } : { [key]: { $set: value } });
            const newFilters = update(this.state.filters, updateCommand);
            return this.setState({ filters: newFilters });
          }}
        />
        <fieldset className="tools">
          <legend>Tools</legend>
          <button
            disabled={entries.length === 0}
            onClick={() => this.createNewPlaylist(entries)}
          >
            Create New Playlist of {entries.length} Tracks
          </button>
          <button
            disabled={entries.length === 0}
            onClick={() => this.downloadEntriesJSON(entries)}
          >
            Export JSON Track Data
          </button>
        </fieldset>
        <table className="visual-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Artist</th>
              <th>Track</th>
              <th>Album</th>
              <th>Duration</th>
              {DETAILS_FIELDS.map(f => <th key={f}>{formatTitle(f)}</th>)}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              entry = entry._merged;
              return (
                <tr key={entry.originalIndex}>
                  <td>{entry.originalIndex + 1}</td>
                  <td>{entry.artists.map(a => a.name).join(', ')}</td>
                  <td>{entry.name}</td>
                  <td>{(entry.album ? entry.album.name : null)}</td>
                  <td>{formatDuration(entry.duration_ms)}</td>
                  {DETAILS_FIELDS.map(f => <td key={f}>{entry[f]}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
