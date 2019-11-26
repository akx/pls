import React from 'react';
import PlaylistEntries from '../components/PlaylistEntries';
import RequestStatus from '../components/RequestStatus';
import Request from '../utils/request';
import { RouteComponentProps } from 'react-router';
import { Playlist } from '../types/spotify';
import { getPlaylist } from '../spotifyApi/playlists';

interface PlaylistContentViewState {
  playlistRequest?: Request<Playlist>;
  playlist?: Playlist;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PlaylistContentViewProps extends RouteComponentProps<{ user_id: string; playlist_id: string }> {}

export default class PlaylistContentView extends React.Component<PlaylistContentViewProps, PlaylistContentViewState> {
  public state: PlaylistContentViewState = {};

  public componentDidMount() {
    this.loadData();
  }

  private loadData() {
    const { params } = this.props.match;
    const userId = params.user_id;
    const playlistId = params.playlist_id;
    const playlistRequest = getPlaylist(userId, playlistId);
    playlistRequest.onComplete.push(playlist => {
      this.setState({ playlist });
    });
    this.setState({ playlistRequest });
  }

  public render() {
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
