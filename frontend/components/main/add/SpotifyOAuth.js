import React, { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import {decode as atob, encode as btoa} from 'base-64'
import axios from 'axios';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env'
import { Image } from 'react-native';
import { text, utils, container } from '../../styles'
import { TouchableOpacity } from 'react-native-gesture-handler';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function SpotifyOAuth() {

    const [isAuthSuccess, setIsAuthSuccess] = useState(false);
    const [token, setToken] = useState(undefined);
    const [playlists, setPlaylists] = useState([]);

    const [request, response, promptAsync] = useAuthRequest(
        {
        clientId: SPOTIFY_CLIENT_ID,
        scopes: [
                'user-read-email', 
                'playlist-modify-public',
                'playlist-read-private',
                'playlist-read-collaborative'
                ],
        // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
        // this must be set to false
        usePKCE: false,
        // For usage in managed apps using the proxy
            redirectUri: 'exp://192.168.1.20:19000'
            // redirectUri: 'https://auth.expo.io/@cerisue/sindosound' for production
        },
        discovery
    );

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;
            console.log(code)
            setIsAuthSuccess(true);

            // getPlaylists();
        }

    }, [response]);

    const getPlaylists = () => {

        axios('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 
                'Authorization' : 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
            data: 'grant_type=client_credentials'
        }) 
        .then(tokenResponse => {

            console.log(tokenResponse.data.access_token);
            setToken(tokenResponse.data.access_token);

            axios('https://api.spotify.com/v1/me/playlists', {
                method: 'GET',
                headers: { 'Authorization' : 'Bearer ' + tokenResponse.data.access_token }
            }) 
            .then (playlistsResponse => {
                setPlaylists(playlistsResponse.data.items);

                console.log(playlists);
            })
        })

    }

  return (

    <TouchableOpacity 
        style={container.container, { height: '75%' }} 
        onPress={() => {
            promptAsync();
        }}
    >
        <Image
            style={container.imageForImport}
            source={require('../../../assets/spotify_icon.png')}
        />
    </TouchableOpacity >
  );
}
