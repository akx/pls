import React from 'react';
import { Link } from 'react-router-dom';
import { getPlaylists } from '../spotifyApi';
import RequestStatus from '../components/RequestStatus';

export default class PlaylistListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { playlistsRequest: null };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const playlistsRequest = getPlaylists();
    playlistsRequest.then(playlists => {
      this.setState({ playlists });
    });
    playlistsRequest.onProgress.push(() => {
      this.forceUpdate();
    });
    this.setState({ playlistsRequest });
  }

  render() {
    const { playlistsRequest } = this.state;
    if (!playlistsRequest) return null;
    if (!playlistsRequest.result) {
      return (
        <RequestStatus
          request={playlistsRequest}
          progressMessage="Loading {n} playlists..."
          errorMessage="Oops, an error occurred loading your playlists."
          retry={() => this.loadData()}
        />
      );
    }
    return (
      <table className="visual-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Public?</th>
            <th>Collaborative?</th>
            <th>Tracks</th>
          </tr>
        </thead>
        <tbody>
          {(this.state.playlists || []).map(pl => (
            <tr key={pl.id}>
              <td>
                <Link to={`/playlist/${pl.owner.id}/${pl.id}`}>
                  <b>{pl.name}</b> by
                  {pl.owner.display_name || pl.owner.id}
                </Link>
              </td>
              <td>{pl.public ? 'Public' : null}</td>
              <td>{pl.collaborative ? 'Collab' : null}</td>
              <td>{pl.tracks.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
