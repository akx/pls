import Request from '../utils/request';
import { AudioFeaturesResponse, AudioFeature } from '../types/spotify';
import { requestAuthenticated } from '../spotifyApi/auth';

export interface AudioFeatureMap {
  [id: string]: AudioFeature;
}

class AudioFeaturesService {
  private readonly cache: Map<string, AudioFeature | null> = new Map();

  ensureLoaded(trackIds: readonly string[]): Request<AudioFeatureMap> {
    trackIds = trackIds.filter(id => id);
    return new Request((resolve, reject, request) => {
      const tick = () => {
        const newTrackIds = trackIds.filter(trackId => !this.cache.has(trackId));
        request.reportProgress({
          loaded: trackIds.length - newTrackIds.length,
          total: trackIds.length,
        });
        if (newTrackIds.length) {
          const trackIdsToQuery = newTrackIds.slice(0, 100); // Maximum for the API
          requestAuthenticated<AudioFeaturesResponse>({
            url: 'https://api.spotify.com/v1/audio-features',
            params: {
              ids: trackIdsToQuery.join(','),
            },
          }).then(resp => {
            resp.data.audio_features.forEach(fobj => {
              if (fobj) {
                this.cache.set(fobj.id, fobj);
              }
            });
            trackIdsToQuery.forEach(id => {
              if (!this.cache.has(id)) {
                console.warn(`No analysis available for ${id}`);
                this.cache.set(id, null);
              }
            });
            setTimeout(tick, 16);
          });
          return;
        }
        const details: AudioFeatureMap = {};
        trackIds.forEach(trackId => {
          const feature = this.cache.get(trackId);
          if (feature) {
            details[trackId] = feature;
          }
        });
        resolve(details);
      };
      tick();
    });
  }

  getDetails(trackId: string): AudioFeature | undefined {
    return this.cache.get(trackId) || undefined;
  }
}

export default new AudioFeaturesService();
