/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error('SPOTIFY_CLIENT_ID is required');
}

module.exports = (options, req) => ({
  plugins: [
    {
      resolve: '@poi/plugin-typescript',
      options: {},
    },
  ],
  entry: './src/index.tsx',
  envs: {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  },
  output: {
    publicUrl: 'https://akx.github.io/pls/',
  },
});
