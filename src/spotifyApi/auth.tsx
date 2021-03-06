import axios, { AxiosRequestConfig } from 'axios';
import { getAuth } from '../auth';

export function requestAuthenticated<TResponse>(options: Partial<AxiosRequestConfig>) {
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
