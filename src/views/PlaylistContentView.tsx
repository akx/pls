import React from 'react';
import { getPlaylist } from '../spotifyApi';
import PlaylistEntries from '../components/PlaylistEntries';
import RequestStatus from '../components/RequestStatus';

export default class PlaylistContentView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { playlistRequest: null };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const { params } = this.props.match;
    const userId = params.user_id;
    const playlistId = params.playlist_id;
    const playlistRequest = getPlaylist(userId, playlistId);
    playlistRequest.then(playlist => {
      this.setState({ playlist });
    });
    this.setState({ playlistRequest });
  }

  render() {
    const { playlistRequest } = this.state;
    if (!playlistRequest) return null;
    if (!playlistRequest.result) {
      return (
        <RequestStatus
          request={playlistRequest}
          progressMessage="Loading playlist..."
          errorMessage="Oops, an error occurred loading this playlists."
          retry={() => this.loadData()}
        />
      );
    }
    if (!this.state.playlist) {
      return <div>Something unexpected happened. Sorry.</div>;
    }
    const { playlist } = this.state;
    return (
      <div>
        <h1>{playlist.name}</h1>
        <PlaylistEntries playlist={playlist} />
      </div>
    );
  }
}
