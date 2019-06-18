import axios, { AxiosRequestConfig } from 'axios/index';
import chunk from 'lodash/chunk';

import { getAuth } from './auth';
import Request, { ProgressWithItems } from './utils/request';
import { PagedResponse, Playlist, PlaylistEntry } from './types/spotify';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requestAuthenticated<TResponse = any>(options: Partial<AxiosRequestConfig>) {
  const auth = getAuth();
  if (!(auth && auth.access_token)) {
    return Promise.reject(new Error('Not authenticated'));
  }
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${auth.access_token}`,
  };

  return axios.request<TResponse>({ method: 'GET', ...options, headers });
}

export type PagedResourceRequest<TResource> = Request<TResource[], Error, ProgressWithItems<TResource>>;

function loadPagedResource<TResource>(
  url: string,
  params: { [key: string]: string },
  limit: number,
  requestLimit = 50,
): PagedResourceRequest<TResource> {
  let offset = 0;
  const items: TResource[] = [];
  return new Request<TResource[], Error, ProgressWithItems<TResource>>((resolve, reject, request) => {
    const tick = () =>
      requestAuthenticated<PagedResponse<TResource>>({
        url,
        params: { ...params, limit: requestLimit, offset },
      })
        .then(({ data }) => {
          data.items.forEach(item => {
            items.push(item);
          });
          request.reportProgress({
            total: data.total,
            loaded: items.length,
            items,
          });
          if (request.cancelRequested) {
            reject(new Error('cancel'));
            return;
          }
          if (data.next && items.length < limit) {
            offset += data.limit;
            setTimeout(tick, 16);
          } else {
            resolve(items);
          }
        })
        .catch(reject);
    tick();
  });
}

export type PlaylistsRequest = PagedResourceRequest<Playlist>;
export type PlaylistEntriesRequest = PagedResourceRequest<PlaylistEntry>;

export function getPlaylists(limit = 0xffff): PlaylistsRequest {
  return loadPagedResource<Playlist>('https://api.spotify.com/v1/me/playlists', {}, limit);
}

export function getPlaylist(userId: string, playlistId: string): Request<Playlist> {
  const plPromise = requestAuthenticated({
    url: `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`,
  }).then(({ data }) => data);
  return new Request<Playlist>(plPromise);
}

export function getPlaylistEntries(
  userId: string,
  playlistId: string,
  limit = 0xffff,
): PlaylistEntriesRequest {
  const req = loadPagedResource<PlaylistEntry>(
    `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
    {},
    limit,
    100,
  );
  req.onComplete.push(entries => {
    for (let i = 0; i < entries.length; i += 1) {
      // eslint-disable-next-line no-param-reassign
      entries[i].originalIndex = i;
    }
  });
  return req;
}

export async function createPlaylistWithTracks(title: string, spotifyUris: readonly string[]) {
  let userResp = await requestAuthenticated({ method: 'GET', url: 'https://api.spotify.com/v1/me' });
  const userData = userResp.data;
  const userName = userData.id;
  let resp = await requestAuthenticated({
    method: 'POST',
    url: `https://api.spotify.com/v1/users/${userName}/playlists`,
    data: {
      name: title,
      description: `Playlist created by pls by @akx on ${new Date().toISOString()}`,
      public: false,
    },
  });
  const newPlaylistId = resp.data.id;
  const spotifyUriChunks = chunk(spotifyUris, 100);
  return new Promise(resolve => {
    const tick = () => {
      if (!spotifyUriChunks.length) {
        resolve(true);
        return;
      }
      const spotifyUriChunk = spotifyUriChunks.shift();
      requestAuthenticated({
        method: 'POST',
        url: `https://api.spotify.com/v1/users/${userName}/playlists/${newPlaylistId}/tracks`,
        data: {
          uris: spotifyUriChunk,
        },
      }).then(() => {
        setTimeout(tick, 16);
      });
    };
    tick();
  });
}
