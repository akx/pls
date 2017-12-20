require('dotenv').config();

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 62019;
module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  host,
  port,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || `http://${host}:${port}/auth`,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
};
