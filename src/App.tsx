import React from 'react';
import { HashRouter, Route, Link } from 'react-router-dom';

import { checkAndSaveAuth, getAuth, hasClientId, redirectToAuth, unauth } from './auth';
import PlaylistListView from './views/PlaylistListView';
import PlaylistContentView from './views/PlaylistContentView';
import SearchToolView from './views/SearchToolView';

export default class App extends React.Component {
  public UNSAFE_componentWillMount() {
    checkAndSaveAuth();
  }

  public render() {
    const auth = getAuth();
    if (!auth) {
      return (
        <div className="please-auth">
          {hasClientId() ? (
            <>
              <p>You have not authenticated with Spotify, or your authentication has expired.</p>
              <button onClick={() => redirectToAuth()}>Authenticate</button>
            </>
          ) : (
            <p>You have not configured a Spotify client ID.</p>
          )}
        </div>
      );
    }
    return (
      <HashRouter>
        <div>
          <nav>
            <Link to="/">List Playlists</Link>
            <Link to="/search-tool">Search Tool</Link>
            <a
              href="#"
              onClick={(e) => {
                unauth();
                this.forceUpdate();
                e.preventDefault();
              }}
            >
              Logout
            </a>
          </nav>
          <article>
            <Route path="/search-tool" exact component={SearchToolView} />
            <Route path="/playlist/:user_id/:playlist_id" component={PlaylistContentView} />
            <Route path="/" exact component={PlaylistListView} />
          </article>
        </div>
      </HashRouter>
    );
  }
}
