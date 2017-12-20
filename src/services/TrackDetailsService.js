import { requestAuthenticated } from '../spotifyApi';
import Request from '../utils/request';

class TrackDetailsService {
  constructor() {
    this.cache = new Map();
    this.listeners = [];
  }

  ensureLoaded(trackIds) {
    return new Request((resolve, reject, request) => {
      const tick = () => {
        const newTrackIds = trackIds.filter(trackId => !this.cache.has(trackId));
        request.reportProgress({
          loaded: trackIds.length - newTrackIds.length,
          total: trackIds.length,
        });
        if (newTrackIds.length) {
          const trackIdsToQuery = newTrackIds.slice(0, 100); // Maximum for the API
          requestAuthenticated({
            url: 'https://api.spotify.com/v1/audio-features',
            params: {
              ids: trackIdsToQuery.join(','),
            },
          })
            .then((resp) => {
              resp.data.audio_features.forEach((fobj) => {
                this.cache.set(fobj.id, fobj);
              });
              setTimeout(tick, 16);
            });
          return;
        }
        const details = {};
        trackIds.forEach((trackId) => {
          details[trackId] = this.cache.get(trackId);
        });
        resolve(details);
      };
      tick();
    });
  }

  getDetails(trackId) {
    return this.cache.get(trackId);
  }
}

export default new TrackDetailsService();
