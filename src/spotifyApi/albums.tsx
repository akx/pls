import { AlbumDetail } from '../types/spotify';
import Request from '../utils/request';
import { requestAuthenticated } from './auth';

export function getAlbum(albumId: string): Request<AlbumDetail> {
  const albumPromise = requestAuthenticated<AlbumDetail>({
    url: `https://api.spotify.com/v1/albums/${albumId}`,
  }).then(({ data }) => data);
  return new Request<AlbumDetail>(albumPromise);
}
