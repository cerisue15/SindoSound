import React, { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import {decode as atob, encode as btoa} from 'base-64'
import axios from 'axios';
import qs from 'qs';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env'
import { Image } from 'react-native';
import { text, utils, container } from '../../styles'
import { TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

SecureStore.deleteItemAsync('SPOTIFY_AUTH_KEY')
const SPOTIFY_AUTH_KEY = 'SPOTIFY_AUTH_KEY';
WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const record = {
    'show_dialog': 'true'
};

export default function SpotifyOAuth() {

    const [isAuthSuccess, setIsAuthSuccess] = useState(false);

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
        redirectUri: 'exp://192.168.1.20:19000',
        // redirectUri: 'https://auth.expo.io/@cerisue/sindosound' for production
        extraParams: record  
        },
        discovery
    );

    React.useEffect(() => {
        if (response?.type === 'success') {
            console.log(response.params);
            const { code } = response.params;

            getToken(code);
        }
    }, [response]);

    const getToken = (code) => {
        const credsB64 = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

        axios('https://accounts.spotify.com/api/token',{
                method: 'post',
                headers: { 
                    'Authorization': `Basic ${credsB64}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: `grant_type=authorization_code&code=${code}&redirect_uri=exp://192.168.1.20:19000`
            }).then(tokenResponse => {
                const storageValue = tokenResponse.data;
                console.log(storageValue)

                if (Platform.OS !== 'web') {
                    // Securely store the auth on your device
                    SecureStore.setItemAsync(SPOTIFY_AUTH_KEY, storageValue.refresh_token);
                }
                setIsAuthSuccess(true);
            }).catch((error) => {
                console.log('it failed')
                console.log(error)
            })
    }
    
    return (

        <TouchableOpacity 
            style={[ { height: '75%' }]} 
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
