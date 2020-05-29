import Request from '../utils/request';
import { AudioFeaturesResponse, AudioFeature } from '../types/spotify';
import { requestAuthenticated } from '../spotifyApi/auth';

export interface AudioFeatureMap {
  [id: string]: AudioFeature;
}

type AudioFeatureCache = Map<string, AudioFeature | null>;

async function doFeaturesQuery(cache: AudioFeatureCache, trackIdsToQuery: readonly string[]) {
  const { data } = await requestAuthenticated<AudioFeaturesResponse>({
    url: 'https://api.spotify.com/v1/audio-features',
    params: {
      ids: trackIdsToQuery.join(','),
    },
  });
  data.audio_features.forEach((fobj) => {
    if (fobj) {
      cache.set(fobj.id, fobj);
    }
  });
  trackIdsToQuery.forEach((id) => {
    if (!cache.has(id)) {
      console.warn(`No analysis available for ${id}`);
      cache.set(id, null);
    }
  });
}

class AudioFeaturesService {
  private readonly cache: AudioFeatureCache = new Map();

  public ensureLoaded(trackIds: readonly string[]): Request<void> {
    return new Request((resolve, reject, request) => {
      const loadRemainingFeatures = async () => {
        const newTrackIds = trackIds.filter((trackId) => trackId && !this.cache.has(trackId));
        request.reportProgress({
          loaded: trackIds.length - newTrackIds.length,
          total: trackIds.length,
        });
        if (newTrackIds.length) {
          const trackIdsToQuery = newTrackIds.slice(0, 100); // Maximum for the API
          await doFeaturesQuery(this.cache, trackIdsToQuery);
          setTimeout(loadRemainingFeatures, 16);
          return;
        }
        resolve();
      };
      loadRemainingFeatures();
    });
  }

  public getDetails(trackId: string): AudioFeature | undefined {
    return this.cache.get(trackId) || undefined;
  }
}

export default new AudioFeaturesService();
