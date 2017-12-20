import React from 'react';
import TrackDetailsService from '../services/TrackDetailsService';
import { getPlaylistEntries } from "../spotifyApi";

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
      loadingPlaylistEntries: true,
    };
    this.trackLoadPromise = null;
  }

  componentDidMount() {
    this.loadPlaylistEntries();
  }


  componentWillUnmount() {
    if (this.state.loadingPlaylistEntries && this.trackLoadPromise) {
      this.trackLoadPromise.cancel();
      this.trackLoadPromise = null;
    }
  }

  loadPlaylistEntries() {
    const { playlist } = this.props;
    if (this.trackLoadPromise) {
      this.trackLoadPromise.cancel();
      this.trackLoadPromise = null;
    }
    this.setState({ loadingPlaylistEntries: true });
    const loader = getPlaylistEntries(playlist.owner.id, playlist.id);
    loader.onProgress = (prom) => {
      this.setState({ loadingPlaylistEntries: true, playlistEntriesProgress: Object.assign({}, prom.progress) });
      console.log(prom.progress);
    };
    loader
      .then((playlistEntries) => {
        this.setState({ loadingPlaylistEntries: false, playlistEntriesProgress: null, playlistEntries });
      })
      .catch((error) => {
        this.setState({ loadingPlaylistEntries: false, playlistEntriesProgress: null, playlistEntriesError: error });
      });
    this.trackLoadPromise = loader;
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
    const { playlist } = this.props;
    const { loadingPlaylistEntries, playlistEntries, playlistEntriesError, playlistEntriesProgress } = this.state;
    if (playlistEntriesError) {
      return (
        <Error
          error={playlistEntriesError}
          message="Oops, an error occurred loading the tracks in this playlist."
          retry={() => this.loadPlaylistEntries()}
        />
      );
    }
    if (loadingPlaylistEntries) {
      return (
        <div>
          Loading playlist entries...
          {playlistEntriesProgress ? (
            <div>
              <span>{playlistEntriesProgress.loaded}/{playlistEntriesProgress.total}</span>
              <progress max={playlistEntriesProgress.total} value={playlistEntriesProgress.loaded}/>
            </div>
          ) : null}
        </div>
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
