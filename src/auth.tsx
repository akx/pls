import * as qs from './utils/querystring';

const clientId = `${import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''}`;

export function hasClientId() {
  return !!clientId;
}

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

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function getRedirectUri() {
  return location.href.replace(/[?#]+.*/g, '');
}

export async function redirectToAuth() {
  if (!clientId) {
    throw new Error('Missing client ID.');
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.plsCodeVerifier = codeVerifier;

  const scope = [
    'user-read-private',
    'playlist-modify-private',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-read-collaborative',
  ].join(' ');

  location.href = `https://accounts.spotify.com/authorize?${qs.stringify({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  })}`;
}

export async function checkAndSaveAuth() {
  const qps = qs.parse(location.search.replace(/^\?/, ''));

  if (!qps.code) {
    throw new Error("Didn't get a code...");
  }
  const codeVerifier = sessionStorage.plsCodeVerifier;
  if (!codeVerifier) {
    console.error('No code verifier found in session storage');
    return null;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify({
      grant_type: 'authorization_code',
      code: qps.code,
      redirect_uri: getRedirectUri(),
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    console.error('Token exchange failed:', response.status);
    return null;
  }

  const data = await response.json();

  const auth = {
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    refresh_token: data.refresh_token,
    expiresAt: +new Date() + parseInt(`${data.expires_in}`, 10) * 1000,
  };

  sessionStorage.plsAuth = JSON.stringify(auth);
  delete sessionStorage.plsCodeVerifier;

  window.history.replaceState({}, document.title, getRedirectUri());

  return auth;
}

export function unauth() {
  sessionStorage.plsAuth = 'null';
  delete sessionStorage.plsCodeVerifier;
}
