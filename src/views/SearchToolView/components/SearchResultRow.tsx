import React, { useState } from 'react';
import upperFirst from 'lodash/upperFirst';
import { Album, Artist, Track } from '../../../types/spotify';
import { SearchQuery } from '../types';

interface SearchResultRowProps {
  query: SearchQuery;
  onAddTrack: (track: Track) => void;
  onAddAlbum: (album: Album) => void;
  onDeleteQuery: (query: SearchQuery) => void;
}

export const formatArtists = (artists: Artist[]) => artists.map(a => a.name).join(', ');

function getAlbumRows(albums: readonly Album[], onAddAlbum: (album: Album) => void) {
  return albums.map(album => (
    <li key={album.id}>
      <>
        {upperFirst(album.album_type)}: {formatArtists(album.artists)} &ndash; {album.name} ({album.total_tracks}{' '}
        tracks)
        <a
          href="#"
          onClick={event => {
            onAddAlbum(album);
            event.preventDefault();
          }}
        >
          [+]
        </a>
      </>
    </li>
  ));
}

function getTrackRows(tracks: readonly Track[], onAddTrack: (track: Track) => void) {
  return tracks.map(track => (
    <li key={track.id}>
      <>
        Track: {formatArtists(track.artists)} &ndash; {track.name} ({track.album.name})
        <a
          href="#"
          onClick={event => {
            onAddTrack(track);
            event.preventDefault();
          }}
        >
          [+]
        </a>
      </>
    </li>
  ));
}

export const SearchResultRow: React.FunctionComponent<SearchResultRowProps> = ({
  query,
  onAddTrack,
  onAddAlbum,
  onDeleteQuery,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { result } = query.request;
  const albums: readonly Album[] = result && result.albums ? result.albums.items : [];
  const tracks: readonly Track[] = result && result.tracks ? result.tracks.items : [];
  return (
    <li>
      {query.query} – {query.request.busy ? 'Busy...' : `${albums.length} albums, ${tracks.length} tracks`}{' '}
      <a
        href="#"
        onClick={e => {
          setCollapsed(!collapsed);
          e.preventDefault();
        }}
      >
        {collapsed ? '(show)' : '(hide)'}
      </a>{' '}
      <a
        href="#"
        onClick={e => {
          onDeleteQuery(query);
          e.preventDefault();
        }}
      >
        (delete)
      </a>
      {!collapsed ? (
        <>
          <ul>{getAlbumRows(albums, onAddAlbum)}</ul>
          <ul>{getTrackRows(tracks, onAddTrack)}</ul>
        </>
      ) : null}
    </li>
  );
};
