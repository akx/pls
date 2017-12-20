import React from 'react';
import TrackDetailsService from '../services/TrackDetailsService';
import { getPlaylistEntries } from '../spotifyApi';
import RequestStatus from './RequestStatus';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import reverse from 'lodash/reverse';

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
    let entries = [].concat(playlistEntries || []); // Always copy for reorderage
    if (this.state.sort !== 'original') {
      const sortKey = this.state.sort;
      entries = sortBy(entries, entry => {
        const details = TrackDetailsService.getDetails(entry.track.id);
        return get(entry.track, sortKey) || get(details, sortKey);
      });
    }
    if (this.state.reverse) {
      entries = reverse(entries);
    }

    return (
      <div>
        {detailsStatus}
        <div>
          <label>
            <span>Sort</span>
            <select
              onChange={(e) => {
                this.setState({ sort: e.target.value });
              }}
            >
              <option value="original">Original sort</option>
              {RESORT_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={this.state.reverse} onChange={(e) => {
              this.setState({ reverse: e.target.checked });
            }}/>
            <span>Reverse</span>
          </label>
        </div>
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
          {entries.map((entry) => {
            const track = entry.track;
            const details = TrackDetailsService.getDetails(track.id);
            return (
              <tr key={entry.originalIndex}>
                <td>{entry.originalIndex + 1}</td>
                <td>{track.artists.map(a => a.name).join(', ')}</td>
                <td>{track.name}</td>
                <td>{(track.album ? track.album.name : null)}</td>
                <td>{formatDuration(track.duration_ms)}</td>
                {details ? DETAILS_FIELDS.map(f => <td key={f}>{details[f]}</td>) : null}
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    );
  }
}
