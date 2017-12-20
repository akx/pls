import axios from 'axios/index';
import { getAuth } from './auth';

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
  const prom = new Promise((resolve, reject) => {
    const tick = () => requestAuthenticated({
      url,
      params: Object.assign({}, params, { limit: requestLimit, offset }),
    }).then(({ data }) => {
      data.items.forEach((playlist) => {
        items.push(playlist);
      });
      prom.progress = {
        total: data.total,
        loaded: items.length,
        items,
      };
      if (prom.onProgress) {
        prom.onProgress(prom);
      }
      if (prom.cancelRequested) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ cancel: true, items, progress: prom.progress });
        return;
      }
      if (data.next && items.length < limit) {
        offset += data.limit;
        setTimeout(tick, 16);
      } else {
        resolve(items);
      }
    }).catch(reject);
    tick();
  });
  prom.progress = {};
  prom.onProgress = null;
  prom.cancel = () => {
    prom.cancelRequested = true;
  };
  return prom;
}

export function getPlaylists(limit = 0xFFFF) {
  return loadPagedResource('https://api.spotify.com/v1/me/playlists', {}, limit);
}

export function getPlaylist(userId, playlistId) {
  return requestAuthenticated({
    url: `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`,
  }).then(({ data }) => data);
}

export function getPlaylistEntries(userId, playlistId, limit = 0xFFFF) {
  return loadPagedResource(
    `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
    {},
    limit,
    100,
  ).then((entries) => {
    for (let i = 0; i < entries.length; i++) {
      // eslint-disable-next-line no-param-reassign
      entries[i].originalIndex = i;
    }
    return entries;
  });
}
