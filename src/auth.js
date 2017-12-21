/* eslint-disable no-restricted-globals */
import qs from 'querystring';

export function getAuth() {
  const auth = JSON.parse(sessionStorage.plsAuth || 'null');
  if (auth) {
    if (+new Date() >= auth.expiresAt) {
      return null;
    }
    return auth;
  }
  return null;
}

export function redirectToAuth() {
  location.href = (`https://accounts.spotify.com/authorize?${qs.stringify({
    response_type: 'token',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: [
      'user-read-private',
      'playlist-modify-private',
      'playlist-modify-public',
      'playlist-read-private',
      'playlist-read-collaborative',
    ].join(' '),
    show_dialog: true,
    redirect_uri: location.href.replace(/[?#]+.*/g, ''),
  })}`);
}

export function checkAndSaveAuth() {
  const hqs = qs.parse(location.hash.replace(/^#/, ''));
  if (hqs.access_token && hqs.token_type === 'Bearer') {
    const auth = Object.assign({ expiresAt: +new Date() + (hqs.expires_in * 1000) }, hqs);
    sessionStorage.plsAuth = JSON.stringify(auth);
    location.hash = '';
    return auth;
  }
  return null;
}

export function unauth() {
  sessionStorage.plsAuth = 'null';
}
