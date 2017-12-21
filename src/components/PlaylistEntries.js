import React from 'react';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import reverse from 'lodash/reverse';
import toPairs from 'lodash/toPairs';
import upperFirst from 'lodash/upperFirst';
import update from 'immutability-helper';

import TrackDetailsService from '../services/TrackDetailsService';
import { createPlaylistWithTracks, getPlaylistEntries, requestAuthenticated } from '../spotifyApi';
import RequestStatus from './RequestStatus';

const DETAILS_FIELDS = [
  'tempo',
  'time_signature',
  'key',
  'mode',
  'acousticness',
  'danceability',
  'energy',
  'instrumentalness',
  'loudness',
  'speechiness',
  'valence',
];

const RESORT_FIELDS = [
  'name',
  'duration_ms',
].concat(DETAILS_FIELDS);

const formatDuration = (ms) => {
  const totalSecs = Math.round(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTitle = f => (f === 'time_signature' ? 'Timesig' : upperFirst(f).replace('_', ' '));

class SortAndFilterForm extends React.Component {
  render() {
    const lteFields = [];
    const gteFields = [];
    RESORT_FIELDS.forEach((f) => {
      gteFields.push((
        <td key={f}>
          <input
            type="number"
            value={this.props.filters[`${f}:gte`] || ''}
            size={3}
            onChange={(e) => {
              this.props.setFilterValue(`${f}:gte`, e.target.value);
            }}
          />
        </td>
      ));
      lteFields.push((
        <td key={f}>
          <input
            type="number"
            value={this.props.filters[`${f}:lte`] || ''}
            size={3}
            onChange={(e) => {
              this.props.setFilterValue(`${f}:lte`, e.target.value);
            }}
          />
        </td>
      ));
    });
    return (
      <fieldset className="sort-and-filter">
        <legend>Sort & Filter</legend>
        <div className="sort">
          <label>
            <span>Sort</span>
            <select
              value={this.props.sort}
              onChange={(e) => {
                this.props.setValue('sort', e.target.value);
              }}
            >
              <option value="original">Original sort</option>
              {RESORT_FIELDS.map(f => <option key={f} value={f}>{formatTitle(f)}</option>)}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={this.props.reverse}
              onChange={(e) => {
                this.props.setValue('reverse', e.target.checked);
              }}
            />
            <span>Reverse</span>
          </label>
        </div>
        <div className="filters">
          <table>
            <thead>
              <tr>
                <th />
                {RESORT_FIELDS.map(f => <th key={f}>{formatTitle(f)}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>≥</td>
                {gteFields}
              </tr>
              <tr>
                <td>≤</td>
                {lteFields}
              </tr>
            </tbody>
          </table>

        </div>
      </fieldset>
    );
  }
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

  createNewPlaylist(tracks) {
    const title = prompt('What should the new playlist be called?');
    if (!title) {
      return false;
    }
    const spotifyUris = tracks.map(track => track.uri).filter(uri => uri);
    createPlaylistWithTracks(title, spotifyUris)
      .then(() => {
        alert('Playlist successfully created. :)');
      })
      .catch((err) => {
        console.error(err);
        alert(`Error creating playlist: ${err}`);
      });
  }

  downloadEntriesJSON(tracks) {
    const playlist = this.props.playlist;
    const jsonData = JSON.stringify(tracks, null, 2);
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
        <fieldset>
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
            {entries.map(entry => (
              <tr key={entry.originalIndex}>
                <td>{entry.originalIndex + 1}</td>
                <td>{entry.artists.map(a => a.name).join(', ')}</td>
                <td>{entry.name}</td>
                <td>{(entry.album ? entry.album.name : null)}</td>
                <td>{formatDuration(entry.duration_ms)}</td>
                {DETAILS_FIELDS.map(f => <td key={f}>{entry[f]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  sortAndFilterEntries(playlistEntries) {
    const filterPairs = toPairs(this.state.filters).filter(([, value]) => value !== '');
    const filterEntry = entry => (
      filterPairs.every(([key, value]) => {
        const filterValue = parseFloat(value);
        if (Number.isNaN(filterValue)) return true;
        const [field, op] = key.split(':');
        const objectValue = entry[field];
        if (objectValue === undefined) return false;
        if (op === 'gte') return objectValue >= filterValue;
        if (op === 'lte') return objectValue <= filterValue;
        console.warn(key, field, op, value);
        return true;
      })
    );
    let entries = (playlistEntries || []).map(ple => Object.assign(
      {},
      ple,
      ple.track,
      TrackDetailsService.getDetails(ple.track.id) || {},
      { track: null },
    )).filter(filterEntry);
    if (this.state.sort !== 'original') {
      const sortKey = this.state.sort;
      entries = sortBy(entries, entry => get(entry, sortKey));
    }
    if (this.state.reverse) {
      entries = reverse(entries);
    }
    return entries;
  }
}
