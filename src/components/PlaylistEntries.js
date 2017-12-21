import React from 'react';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import reverse from 'lodash/reverse';

import TrackDetailsService from '../services/TrackDetailsService';
import { getPlaylistEntries } from '../spotifyApi';
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
  'duration_ms',
].concat(DETAILS_FIELDS);

const formatDuration = (ms) => {
  const totalSecs = Math.round(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

class SortAndFilterForm extends React.Component {
  render() {
    return (
      <div>
        <label>
          <span>Sort</span>
          <select
            value={this.props.sort}
            onChange={(e) => {
              this.props.setValue('sort', e.target.value);
            }}
          >
            <option value="original">Original sort</option>
            {RESORT_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
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
          setValue={(key, value) => {
            return this.setState({ [key]: value });
          }}
        />
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Artist</th>
              <th>Track</th>
              <th>Album</th>
              <th>Duration</th>
              {DETAILS_FIELDS.map(f => <th key={f}>{f}</th>)}
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
    let entries = (playlistEntries || []).map(ple => Object.assign(
      {},
      ple,
      ple.track,
      TrackDetailsService.getDetails(ple.track.id) || {},
    ));
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
