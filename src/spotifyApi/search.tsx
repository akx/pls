import { SearchResult } from '../types/spotify';
import Request from '../utils/request';
import { requestAuthenticated } from './auth';

export type SearchRequest = Request<SearchResult>;

export function executeSearch(query: string, types: readonly string[]): SearchRequest {
  const plPromise = requestAuthenticated<SearchResult>({
    url: `https://api.spotify.com/v1/search`,
    params: {
      q: query,
      type: types.join(','),
      limit: 50,
    },
  }).then(({ data }) => data);
  return new Request<SearchResult>(plPromise);
}
