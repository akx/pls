import * as React from 'react';
import { Link } from 'react-router-dom';
import { getPlaylists } from '../spotifyApi';
import Error from '../components/Error';

export default class PlaylistList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    this.setState({ loading: true });
    getPlaylists(10)
      .then((playlists) => {
        this.setState({ loading: false, playlists });
      })
      .catch((error) => {
        this.setState({ loading: false, error });
      });
  }

  render() {
    if (this.state.loading) {
      return <div>Loading playlists...</div>;
    }
    if (this.state.error) {
      return (
        <Error
          error={this.state.error}
          message="Oops, an error occurred loading your playlists."
          retry={() => this.loadData()}
        />
      );
    }
    return (
      <table>
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
                <b>{pl.name}</b> by {pl.owner.display_name || pl.owner.id}
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

