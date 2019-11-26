import { SearchRequest } from '../../spotifyApi/search';

export interface SearchQuery {
  query: string;
  request: SearchRequest;
}
