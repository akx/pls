import { AudioFeature, PlaylistEntry, Track } from './spotify';

export interface AugmentedPlaylistEntry
  extends PlaylistEntry,
    Track,
    Partial<Omit<AudioFeature, 'id' | 'track_uri' | 'duration_ms' | 'type' | 'uri'>> {
  artistName: string;
  albumName: string;
}
