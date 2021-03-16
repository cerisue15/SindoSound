import React, { useState, useEffect } from 'react';
import { Text, View, Image, FlatList, Button, ImageStore, TouchableOpacity } from 'react-native';
import { Feather, Entypo, FontAwesome } from '@expo/vector-icons';
import { text, utils, container } from '../../styles'
import icon from '../../../assets/icon.png'
import { LinearGradient } from 'expo-linear-gradient';

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env'
import { encode as btoa } from 'base-64';
import { connect } from 'react-redux'
import SpotifyOAuth from './SpotifyOAuth'
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


import firebase from 'firebase'
require('firebase/firestore')

function AddPlaylists(props) {
    const [user, setUser] = useState(null);
    const [refreshToken, setRefreshToken] = useState('')
    const [token, setToken] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    async function getStorageValue() {
        const value = await SecureStore.getItemAsync('SPOTIFY_AUTH_KEY');
        if(value !== null) {
            return value
        }
        else return null
    }

    const getSpotifyPlaylists = async () => {

        const refresh_token = await SecureStore.getItemAsync('SPOTIFY_AUTH_KEY');
        console.log(refresh_token)
        if (refresh_token === null) {
            return
        }

        const credsB64 = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
        axios('https://accounts.spotify.com/api/token',{
            method: 'post',
            headers: { 
                'Authorization': `Basic ${credsB64}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: `grant_type=refresh_token&refresh_token=${refresh_token}`
        })
        .then(tokenResponse => {
            // console.log(tokenResponse);
            setToken(tokenResponse.data.access_token)

            axios(`https://api.spotify.com/v1/me/playlists`, {
                method: 'get',
                headers: { 'Authorization' : `Bearer ${tokenResponse.data.access_token}` }
            }) 
            .then (playlistsResponse => {
                setPlaylists(playlistsResponse.data.items)
            })
        })
        .catch(error => {
            console.log(error);
        })

        
    }

    const toggleMusicServices = () => {
        setModalVisible(!isModalVisible);
    };

    useEffect(() => {
        const { currentUser } = props;
        setUser(currentUser)

        getSpotifyPlaylists()

        if (currentUser == undefined){
            firebase.firestore()
            .collection("users")
            .doc(currentUser.uid)
            .get()
            .then((snapshot) => {
                if (snapshot.exists) {
                    setUser({ uid: currentUser.uid, ...snapshot.data() });
                }
                else {
                    console.log('does not exist')
                }
            })
        }
    }, []);

    return (
        <View style={[container.container, utils.backgroundBlack]}>
            
            <LinearGradient
                // Background Linear Gradient
                colors={['#2560F6', '#00FFF0','transparent']}
                style={utils.background}
            />
            <View style={[container.column, {marginVertical: 25, justifyContent: 'center'}]}>
                    <Text style={[text.white, {textAlign: 'center', marginBottom: 15, fontSize: 20}]}>
                        Add playlist from your Music Service(s)
                    </Text>

                    <View style={[utils.backgroundWhite, container.horizontal, { borderRadius: '35%',  height: 100, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                        <SpotifyOAuth/>
                        <TouchableOpacity 
                            disabled={true}
                            style={[{ height: '80%', marginHorizontal: 25 }]} 
                            onPress={() => {}}
                        >
                            <Image
                                style={[container.imageForGrid, {opacity: 0.5}]}
                                source={require('../../../assets/tidal_icon.png')}
                            /> 
                        </TouchableOpacity>

                        <TouchableOpacity 
                            disabled={true}
                            style={[ { height: '75%', opacity: 0.5}]} 
                            onPress={() => {}}
                        >
                            <Image
                                style={container.imageForGrid}
                                source={require('../../../assets/apple_icon.png')}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={[{ marginTop: 20}]}>
                        <Button
                            title={'Load Playlists'}
                            onPress={getSpotifyPlaylists}
                        />
                    </View>
            </View>

            <View style={[{margin: 15}]}>
                {playlists.length !== 0 && (
                    <Text style={[text.white, text.bold, {textAlign: 'left', marginVertical: 15, fontSize: 20}]}>
                        Spotify Playlists
                    </Text>
                )}

                <FlatList
                    horizontal={true}
                    data={playlists}
                    style={[]}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[{marginHorizontal: 4}, utils.borderWhite]}
                            onPress={() => props.navigation.navigate("Save", { item, user, token })}>
                            <Text style={[text.white, text.bold, text.center, {paddingVertical: 10}]}>{item.name.length > 15 ? `${item.name.slice(0, 15)} ...` : item.name}</Text>
                            <Image
                                style={[container.imageForHorizontalScroll]}
                                source={item.images[0] !== undefined 
                                    ? { uri: item.images[0].url } 
                                    : require('../../../assets/icon.png')}
                            /> 
                        </TouchableOpacity>
                        
                    )}
                />
            </View>

            <View style={{margin: 50}}></View>

        </View>
    );
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})

export default connect(mapStateToProps, null)(AddPlaylists);
    