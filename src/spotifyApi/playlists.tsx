import { loadPagedResource, PagedResourceRequest } from './paged';
import { Playlist, PlaylistEntry, User } from '../types/spotify';
import Request from '../utils/request';
import { requestAuthenticated } from './auth';
import chunk from 'lodash/chunk';

export type PlaylistsRequest = PagedResourceRequest<Playlist>;
export type PlaylistEntriesRequest = PagedResourceRequest<PlaylistEntry>;

export function getPlaylists(limit = 0xffff): PlaylistsRequest {
  return loadPagedResource<Playlist>('https://api.spotify.com/v1/me/playlists', {}, limit);
}

export function getPlaylist(userId: string, playlistId: string): Request<Playlist> {
  return new Request<Playlist>(
    requestAuthenticated<Playlist>({
      url: `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`,
    }).then(({ data }) => data),
  );
}

export function getPlaylistEntries(userId: string, playlistId: string, limit = 0xffff): PlaylistEntriesRequest {
  const req = loadPagedResource<PlaylistEntry>(
    `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
    {},
    limit,
    100,
  );
  req.onComplete.push((entries) => {
    for (let i = 0; i < entries.length; i += 1) {
      // eslint-disable-next-line no-param-reassign
      entries[i].originalIndex = i;
    }
  });
  return req;
}

export async function createPlaylistWithTracks(title: string, spotifyUris: readonly string[]) {
  const userResp = await requestAuthenticated<User>({ method: 'GET', url: 'https://api.spotify.com/v1/me' });
  const userData = userResp.data;
  const userName = userData.id;
  const { data } = await requestAuthenticated<Playlist>({
    method: 'POST',
    url: `https://api.spotify.com/v1/users/${userName}/playlists`,
    data: {
      name: title,
      description: `Playlist created by pls by @akx on ${new Date().toISOString()}`,
      public: false,
    },
  });
  const newPlaylistId = data.id;
  const spotifyUriChunks = chunk(spotifyUris, 100);
  return new Promise((resolve) => {
    async function postNextChunk() {
      if (!spotifyUriChunks.length) {
        resolve(true);
        return;
      }
      const spotifyUriChunk = spotifyUriChunks.shift();
      await requestAuthenticated({
        method: 'POST',
        url: `https://api.spotify.com/v1/users/${userName}/playlists/${newPlaylistId}/tracks`,
        data: {
          uris: spotifyUriChunk,
        },
      });
      setTimeout(postNextChunk, 16);
    }
    postNextChunk();
  });
}
