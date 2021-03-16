import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } from '@env'
const router = require('express').Router()

router.get('/api/spotify-credentials', (req, res, next) => {
  const clientId = SPOTIFY_CLIENT_ID;
  const clientSecret = SPOTIFY_CLIENT_SECRET;
  const redirectUri = REDIRECT_URI;
  const spotifyCredentials = { clientId, clientSecret, redirectUri };
  res.json(spotifyCredentials);
});