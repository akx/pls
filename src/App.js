import * as React from 'react';
import { HashRouter, Route, Link } from 'react-router-dom';

import PlaylistList from './views/PlaylistList';
import { checkAndSaveAuth, getAuth, redirectToAuth } from './auth';
import PlaylistView from './views/PlaylistView';

export default class App extends React.Component {
  componentWillMount() {
    checkAndSaveAuth();
  }

  render() {
    const auth = getAuth();
    if (!auth) {
      return (
        <div>
          <p>You have not authenticated with Spotify, or your authentication has expired.</p>
          <button onClick={() => redirectToAuth()}>Authenticate</button>
        </div>
      );
    }
    return (
      <HashRouter>
        <div>
          <nav>
            <Link to="/">Home</Link>
          </nav>
          <article>
            <Route path="/playlist/:user_id/:playlist_id" component={PlaylistView}/>
            <Route path="/" exact component={PlaylistList}/>
          </article>
        </div>
      </HashRouter>
    );
  }
}
