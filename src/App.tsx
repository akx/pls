import React from 'react';
import { HashRouter, Route, Link } from 'react-router-dom';

import { checkAndSaveAuth, getAuth, redirectToAuth, unauth } from './auth';
import PlaylistListView from './views/PlaylistListView';
import PlaylistContentView from './views/PlaylistContentView';

export default class App extends React.Component {
  componentWillMount() {
    checkAndSaveAuth();
  }

  render() {
    const auth = getAuth();
    if (!auth) {
      return (
        <div className="please-auth">
          <p>You have not authenticated with Spotify, or your authentication has expired.</p>
          <button onClick={() => redirectToAuth()}>Authenticate</button>
        </div>
      );
    }
    return (
      <HashRouter>
        <div>
          <nav>
            <Link to="/">List Playlists</Link>
            <a
              href="#"
              onClick={e => {
                unauth();
                this.forceUpdate();
                e.preventDefault();
              }}
            >
              Logout
            </a>
          </nav>
          <article>
            <Route path="/playlist/:user_id/:playlist_id" component={PlaylistContentView} />
            <Route path="/" exact component={PlaylistListView} />
          </article>
        </div>
      </HashRouter>
    );
  }
}
