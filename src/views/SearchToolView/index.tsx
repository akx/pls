import React from 'react';
import { executeSearch } from '../../spotifyApi/search';
import { Album, Track } from '../../types/spotify';
import { getAlbum } from '../../spotifyApi/albums';
import { formatArtists, SearchResultRow } from './components/SearchResultRow';
import { SearchQuery } from './types';
import { createNewPlaylistInteractive } from '../../utils/playlists';

interface SearchToolViewState {
  searchContent: string;
  searchAlbums: boolean;
  searchTracks: boolean;
  queries: SearchQuery[];
  playlist: Track[];
}

export default class SearchToolView extends React.Component<{}, SearchToolViewState> {
  public state: SearchToolViewState = {
    playlist: [],
    queries: [],
    searchAlbums: true,
    searchTracks: true,
    searchContent: '',
  };

  private executeSearch = () => {
    const types = [this.state.searchAlbums ? 'album' : '', this.state.searchTracks ? 'track' : ''].filter(Boolean);
    const queryStrings = this.state.searchContent
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    const extantQueryStrings = new Set(this.state.queries.map(q => q.query));
    const newQueries: SearchQuery[] = [];
    if (!types.length) return;
    queryStrings.forEach(query => {
      if (extantQueryStrings.has(query)) {
        return;
      }
      const request = executeSearch(query, types);
      request.onComplete.push(() => {
        this.forceUpdate(); // uggghhh...
      });
      newQueries.push({
        query,
        request,
      });
    });
    if (!newQueries.length) return;
    this.setState(state => ({ queries: state.queries.concat(newQueries) }));
  };

  public render() {
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: '350px', flex: 1 }}>
          <textarea
            value={this.state.searchContent}
            onChange={e => this.setState({ searchContent: e.target.value })}
            rows={10}
            style={{ width: '100%' }}
            placeholder="Enter search queries here."
          />
          <br />
          <button style={{ width: '100%', display: 'block' }} onClick={this.executeSearch}>
            Search
          </button>
          <label>
            <input
              type="checkbox"
              checked={this.state.searchAlbums}
              onChange={e => this.setState({ searchAlbums: e.target.checked })}
            />
            Albums
          </label>
          <label>
            <input
              type="checkbox"
              checked={this.state.searchTracks}
              onChange={e => this.setState({ searchTracks: e.target.checked })}
            />
            Tracks
          </label>
          <br />
          <br />
          <button style={{ width: '100%', display: 'block' }} onClick={() => this.setState({ queries: [] })}>
            Clear Queries
          </button>
          <button style={{ width: '100%', display: 'block' }} onClick={this.removeQueriesWithResults}>
            Remove Queries with Results
          </button>
        </div>
        <div style={{ flex: 3 }}>
          <ul>
            {this.state.queries.map(q => (
              <SearchResultRow
                key={q.query}
                query={q}
                onAddTrack={this.onAddTrack}
                onAddAlbum={this.onAddAlbum}
                onDeleteQuery={this.onDeleteQuery}
              />
            ))}
          </ul>
        </div>
        <div style={{ flex: 3 }}>
          <ul>
            {this.state.playlist.map(t => (
              <li key={t.id}>
                {formatArtists(t.artists)} &ndash; {t.name}
              </li>
            ))}
          </ul>
          {this.state.playlist.length ? <button onClick={this.savePlaylist}>Save Playlist...</button> : null}
        </div>
      </div>
    );
  }

  private onAddTrack = (track: Track) => {
    this.addTracks([track]);
  };

  private addTracks = (tracks: readonly Track[]) => {
    this.setState(state => {
      // TODO: fix O(n^2)
      const newTracks = tracks.filter(track => !state.playlist.find(plt => plt.id === track.id));
      return { playlist: state.playlist.concat(newTracks) };
    });
  };

  private onAddAlbum = (album: Album) => {
    const albumReq = getAlbum(album.id);
    albumReq.onComplete.push(albumDetail => {
      this.addTracks(albumDetail.tracks.items);
    });
  };

  private savePlaylist = () => {
    const spotifyUris = this.state.playlist.map(track => track.uri).filter(Boolean);
    return createNewPlaylistInteractive(spotifyUris);
  };

  private onDeleteQuery = (query: SearchQuery) => {
    this.setState(state => {
      this.setState({
        queries: state.queries.filter(q => q !== query),
      });
    });
  };

  private removeQueriesWithResults = () => {
    this.setState(({ queries }) => {
      this.setState({
        queries: queries.filter(q => {
          const result = q.request.result;
          if (result === undefined) return true; // keep ones still loading
          if (result.albums?.items.length) return false;
          if (result.tracks?.items.length) return false;
          if (result.artists?.items.length) return false;
          return true;
        }),
      });
    });
  };
}
