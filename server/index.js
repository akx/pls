require('dotenv').config();
const express = require('express');
const qs = require('querystring');
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const config = require('./config');


const app = express();
app.use(require('cookie-parser')());

const authJwt = expressJwt({
  secret: config.jwtSecret,
  getToken: req => req.cookies.plsauth,
});

const spotifyApi = new SpotifyWebApi({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.redirectUri,
});

app.get('/auth', (req, res) => {
  if (req.query.code) {
    axios.request({
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      data: qs.stringify({
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: config.redirectUri,
      }),
      auth: {
        username: config.clientId,
        password: config.clientSecret,
      },
    })
      .then((response) => {
        res.cookie('plsauth', jwt.sign(
          {auth: response.data},
          config.jwtSecret,
          {expiresIn: response.data.expires_in},
        ));
        res.redirect('/');
      })
      .catch((error) => {
        console.error(error);
        res.json({
          error: 'Failed to get authorization from Spotify',
          spotify: (error.response ? {
            status: error.response.status,
            data: error.response.data,
          } : null),
        });
      });
    return;
  }
  const scopes = 'user-read-private playlist-modify-private playlist-modify-public';
  res.redirect(`https://accounts.spotify.com/authorize?${qs.stringify({
    response_type: 'code',
    client_id: config.clientId,
    scope: scopes,
    redirect_uri: config.redirectUri,
  })}`);
});

app.get('/', authJwt, (req, res) => {
  if (!req.user) {
    res.end('<a href=/auth>Authenticate with Spotify</a>');
    return;
  }
  res.json(req.user);
});

app.listen(config.port, config.host, () => {
  console.log(`Listening on ${config.host}:${config.port}`);
});
