import axios from 'axios/index';
import { getAuth } from './auth';
import Request from './utils/request';
import chunk from 'lodash/chunk';

export function requestAuthenticated(options) {
  const auth = getAuth();
  if (!(auth && auth.access_token)) {
    return Promise.reject(new Error('Not authenticated'));
  }
  const headers = Object.assign({}, options.headers || {}, {
    Authorization: `Bearer ${auth.access_token}`,
  });

  return axios.request(Object.assign({ method: 'GET' }, options, { headers }));
}

function loadPagedResource(url, params, limit, requestLimit = 50) {
  let offset = 0;
  const items = [];
  return new Request((resolve, reject, request) => {
    const tick = () => requestAuthenticated({
      url,
      params: Object.assign({}, params, { limit: requestLimit, offset }),
    })
      .then(({ data }) => {
        data.items.forEach((playlist) => {
          items.push(playlist);
        });
        request.reportProgress({
          total: data.total,
          loaded: items.length,
          items,
        });
        if (request.cancelRequested) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ cancel: true });
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

export function getPlaylists(limit = 0xFFFF) {
  return loadPagedResource('https://api.spotify.com/v1/me/playlists', {}, limit);
}

export function getPlaylist(userId, playlistId) {
  const plPromise = requestAuthenticated({
    url: `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`,
  }).then(({ data }) => data);
  return new Request(plPromise);
}

export function getPlaylistEntries(userId, playlistId, limit = 0xFFFF) {
  const req = loadPagedResource(
    `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
    {},
    limit,
    100,
  );
  req.then((entries) => {
    for (let i = 0; i < entries.length; i++) {
      // eslint-disable-next-line no-param-reassign
      entries[i].originalIndex = i;
    }
    return entries;
  });
  return req;
}

export function createPlaylistWithTracks(title, spotifyUris) {
  return requestAuthenticated({ method: 'GET', url: 'https://api.spotify.com/v1/me' })
    .then((userResp) => {
      const userData = userResp.data;
      const userName = userData.id;
      return requestAuthenticated({
        method: 'POST',
        url: `https://api.spotify.com/v1/users/${userName}/playlists`,
        data: {
          name: title,
          description: `Playlist created by pls by @akx on ${new Date().toISOString()}`,
          public: false,
        },
      }).then((resp) => {
        const newPlaylistId = resp.data.id;
        const spotifyUriChunks = chunk(spotifyUris, 100);
        return new Promise((resolve) => {
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
      });
    });
}
