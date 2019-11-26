import without from 'lodash/without';

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
];

export const SORT_FIELDS = ['name', 'artistName', 'albumName', 'duration_ms', 'shuffleHash'].concat(DETAILS_FIELDS);

export const NUMERIC_FILTER_FIELDS = ['duration_ms'].concat(DETAILS_FIELDS);

export const QUANTIFIABLE_NUMERIC_FIELDS = without(NUMERIC_FILTER_FIELDS, 'key', 'time_signature', 'mode');

export const STRING_FILTER_FIELDS = ['name', 'artistName', 'albumName'];
