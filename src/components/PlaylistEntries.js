import React from 'react';
import TrackDetailsService from '../services/TrackDetailsService';
import { getPlaylistEntries } from "../spotifyApi";
import RequestStatus from "./RequestStatus";

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
    playlistEntriesRequest._promise.then((playlistEntries) => {
      this.setState({ playlistEntries });
    });
    this.setState({ playlistEntriesRequest });
  }

  loadTrackDetails() {
    const trackIds = this.state.playlistEntries.map(ple => ple.track.id);
    this.setState({ loadingTrackDetails: true });
    return TrackDetailsService.loadDetails(trackIds)
      .then(() => {
        this.setState({ loadingTrackDetails: false });
      })
      .catch((err) => {
        console.error(err);
        this.setState({ loadingTrackDetails: false });
      });
  }

  render() {
    const { playlistEntries, playlistEntriesRequest } = this.state;
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
    return (
      <div>
        <button onClick={() => this.loadTrackDetails()} disabled={this.state.loadingTrackDetails}>
          Load track details...
        </button>
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
          {(playlistEntries || []).map(entry => {
            const track = entry.track;
            const details = TrackDetailsService.getDetails(track.id);
            return (
              <tr key={`${track.id}_${entry.originalIndex}`}>
                <td>{entry.originalIndex + 1}</td>
                <td>{track.artists.map((a) => a.name).join(', ')}</td>
                <td>{track.name}</td>
                <td>{(track.album ? track.album.name : null)}</td>
                <td>{formatDuration(track.duration_ms)}</td>
                {details ? DETAILS_FIELDS.map(f => <th key={f}>{details[f]}</th>) : null}
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    );
  }
}
