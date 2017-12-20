import * as React from 'react';
import { Link } from 'react-router-dom';
import { getPlaylist, getPlaylistTracks } from '../spotifyApi';
import Error from '../components/Error';
import Tracklist from "../components/Tracklist";

export default class PlaylistList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loadingPlaylist: false, loadingTracks: false };
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    if (this.state.loadingTracks && this.trackLoadPromise) {
      this.trackLoadPromise.cancel();
      this.trackLoadPromise = null;
    }
  }

  loadData() {
    const params = this.props.match.params;
    const userId = params.user_id;
    const playlistId = params.playlist_id;
    this.setState({ loadingPlaylist: true, loadingTracks: false });
    getPlaylist(userId, playlistId)
      .then((playlist) => {
        this.setState({ loadingPlaylist: false, playlist });
        this.loadTracks();
      })
      .catch((error) => {
        this.setState({ loadingPlaylist: false, playlistError: error });
      });
  }

  loadTracks() {
    if (!this.state.playlist) return;
    const { playlist } = this.state;
    if (this.trackLoadPromise) {
      this.trackLoadPromise.cancel();
      this.trackLoadPromise = null;
    }
    this.setState({ loadingTracks: true });
    const loader = getPlaylistTracks(playlist.owner.id, playlist.id);
    loader.onProgress = (prom) => {
      this.setState({ loadingTracks: true, tracksProgress: Object.assign({}, prom.progress) });
      console.log(prom.progress);
    };
    loader
      .then((tracks) => {
        this.setState({ loadingTracks: false, tracksProgress: null, tracks });
      })
      .catch((error) => {
        this.setState({ loadingTracks: false, tracksProgress: null, tracksError: error });
      });
    this.trackLoadPromise = loader;
  }

  getTracksContainer() {
    const { playlist, loadingTracks, tracks, tracksError, tracksProgress } = this.state;
    if (tracksError) {
      return (
        <Error
          error={tracksError}
          message="Oops, an error occurred loading the tracks in this playlist."
          retry={() => this.loadTracks()}
        />
      );
    }
    if (loadingTracks) {
      return (
        <div>
          Loading tracks...
          {tracksProgress ? (
            <div>
              <span>{tracksProgress.loaded}/{tracksProgress.total}</span>
              <progress max={tracksProgress.total} value={tracksProgress.loaded}/>
            </div>
          ) : null}
        </div>
      );
    }
    return (<Tracklist playlist={playlist} tracks={tracks} />);
  }

  render() {
    if (this.state.loadingPlaylist) {
      return <div>Loading...</div>;
    }
    if (this.state.playlistError) {
      return (
        <Error
          error={this.state.playlistError}
          message="Oops, an error occurred loading this playlist."
          retry={() => this.loadData()}
        />
      );
    }
    if (!this.state.playlist) return null;
    const { playlist } = this.state;
    const tracksContainer = this.getTracksContainer();
    return (
      <div>
        <h1>{playlist.name}</h1>
        {tracksContainer}
      </div>
    );
  }
}

