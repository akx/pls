require('dotenv').config();

module.exports = {
  presets: [
    require('poi-preset-react')(),
  ],
  entry: './src/index.js',
  env: {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  },
};
