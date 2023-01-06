import without from 'lodash/without';

export const releaseDateField = 'release_date' as const;

export const DETAILS_FIELDS = [
  'time_signature',
  'key',
  'mode',
  'tempo',
  'acousticness',
  'danceability',
  'energy',
  'instrumentalness',
  'loudness',
  'speechiness',
  'valence',
  'popularity',
  releaseDateField,
] as const;

export const SORT_FIELDS = [
  'name',
  'artistName',
  'albumName',
  'duration_ms',
  'shuffleHash',
  ...DETAILS_FIELDS,
] as const;

export const NUMERIC_FILTER_FIELDS = ['duration_ms', ...DETAILS_FIELDS] as const;

export const QUANTIFIABLE_NUMERIC_FIELDS = without(NUMERIC_FILTER_FIELDS, 'key', 'time_signature', 'mode');

export const STRING_FILTER_FIELDS = ['name', 'artistName', 'albumName', releaseDateField] as const;
