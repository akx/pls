import * as React from 'react';
import { Link } from 'react-router-dom';
import { getPlaylist } from '../spotifyApi';
import Error from '../components/Error';
import PlaylistEntries from "../components/PlaylistEntries";

export default class PlaylistList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loadingPlaylist: false };
  }

  componentDidMount() {
    this.loadData();
  }


  loadData() {
    const params = this.props.match.params;
    const userId = params.user_id;
    const playlistId = params.playlist_id;
    this.setState({ loadingPlaylist: true });
    getPlaylist(userId, playlistId)
      .then((playlist) => {
        this.setState({ loadingPlaylist: false, playlist });
      })
      .catch((error) => {
        this.setState({ loadingPlaylist: false, playlistError: error });
      });
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
    return (
      <div>
        <h1>{playlist.name}</h1>
        <PlaylistEntries playlist={playlist} />
      </div>
    );
  }
}

