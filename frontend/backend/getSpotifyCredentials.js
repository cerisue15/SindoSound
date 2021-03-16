import axios from 'axios'

const getSpotifyCredentials = async () => {
  const res = await axios.get('exp://192.168.1.5:19000/api/spotify-credentials')
  const spotifyCredentials = res.data
  return spotifyCredentials
}