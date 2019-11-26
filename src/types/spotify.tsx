/* eslint-disable @typescript-eslint/no-empty-interface */

export interface User {
  id: string;
}

export interface SpotifyResource {
  href: string;
}

export interface PagedResponse<TResource> extends SpotifyResource {
  items: readonly TResource[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface PlaylistsResponse extends PagedResponse<Playlist> {}

export interface Playlist extends SpotifyResource {
  collaborative: boolean;
  external_urls: ExternalUrls;
  id: string;
  images: Image[];
  name: string;
  owner: Owner;
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  height: number | null;
  url: string;
  width: number | null;
}

export interface Owner {
  display_name: string | null;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
}

export interface PlaylistTracksResponse extends PagedResponse<PlaylistEntry> {}

export interface PlaylistEntry {
  originalIndex?: number; // _not_ in response data!
  added_at: string;
  added_by: AddedBy;
  is_local: boolean;
  primary_color: string | null;
  track: Track;
  video_thumbnail: VideoThumbnail;
}

export interface AddedBy {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
  name?: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Track {
  album: Album;
  artists: AddedBy[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  episode: boolean;
  explicit: boolean;
  external_ids: TrackExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: null | string;
  // ignored
  //track: boolean;
  track_number: number;
  type: string;
  uri: string;
}

export interface Album {
  album_type: string;
  artists: AddedBy[];
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface TrackExternalIds {
  isrc: string;
}

export interface VideoThumbnail {
  url: string | null;
}

export interface AudioFeaturesResponse {
  audio_features: AudioFeature[];
}

export interface AudioFeature {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
  id: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
}
