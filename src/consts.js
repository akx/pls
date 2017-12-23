export const DETAILS_FIELDS = [
  'tempo',
  'time_signature',
  'key',
  'mode',
  'acousticness',
  'danceability',
  'energy',
  'instrumentalness',
  'loudness',
  'speechiness',
  'valence',
  'popularity',
];

export const SORT_FIELDS = [
  'name',
  'artistName',
  'albumName',
  'duration_ms',
].concat(DETAILS_FIELDS);

export const NUMERIC_FILTER_FIELDS = [
  'duration_ms',
].concat(DETAILS_FIELDS);

export const STRING_FILTER_FIELDS = [
  'name',
  'artistName',
  'albumName',
];
