/* eslint-disable import/no-extraneous-dependencies */
const ReactPreset = require('poi-preset-react');
require('dotenv').config();

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error('SPOTIFY_CLIENT_ID is required');
}


module.exports = {
  presets: [
    ReactPreset(),
  ],
  entry: './src/index.js',
  env: {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  },
  homepage: './',
};
