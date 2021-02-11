import React, { useState, useLayoutEffect, useEffect } from 'react'
import { View, TextInput, Image, Text, ActivityIndicator } from 'react-native'
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';

import axios from 'axios';
import {decode as atob, encode as btoa} from 'base-64'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env'
import SpotifyOAuth from './SpotifyOAuth'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUserPosts } from '../../../redux/actions/index'
import * as AuthSession from 'expo-auth-session';

import firebase from 'firebase'
require("firebase/firestore")
require("firebase/firebase-storage")

import { container, utils, form, text, navbar } from '../../styles'
import * as Linking from 'expo-linking';

function Save(props) {
    const [caption, setCaption] = useState("")
    const [playlistSongs, setPlaylistSongs] = useState([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(false)
    const [token, setToken] = useState('')

    const redirectUrl = AuthSession.getRedirectUrl({ useProxy: false });
    console.log(redirectUrl)
    console.log(Linking.makeUrl())

    useEffect(() => {
        axios('https://accounts.spotify.com/api/token', {
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic '+ btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
            },
            data: 'grant_type=client_credentials',
            method: 'POST'
        })
        .then(tokenResponse => {
            // console.log(tokenResponse.data.access_token);
            setToken(tokenResponse.data.access_token);
        })
    }, [])

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <Feather style={navbar.image} name="check" size={24} color="green" onPress={() => { uploadImage() }} />
            ),
        });
    }, [playlistSongs]); // caption

    const uploadImage = async () => {
        if (uploading) {
            return;
        }
        setUploading(true)
        const uri = props.route.params.image;
        const childPath = `post/${firebase.auth().currentUser.uid}/${Math.random().toString(36)}`;
        console.log(childPath)

        const response = await fetch(uri);
        const blob = await response.blob();

        const task = firebase
            .storage()
            .ref()
            .child(childPath)
            .put(blob);

        const taskProgress = snapshot => {
            console.log(`transferred: ${snapshot.bytesTransferred}`)
        }

        const taskCompleted = () => {
            task.snapshot.ref.getDownloadURL().then((snapshot) => {
                savePostData(snapshot);
            })
        }

        const taskError = snapshot => {
            console.log(snapshot)
            setUploading(false)
            setError(true)

        }

        task.on("state_changed", taskProgress, taskError, taskCompleted);
    }

    const savePostData = (downloadURL) => {
        firebase.firestore()
            .collection('posts')
            .doc(firebase.auth().currentUser.uid)
            .collection("userPosts")
            .add({
                playlistSongs,
                downloadURL,
                caption,
                likesCount: 0,
                commentsCount: 0,
                creation: firebase.firestore.FieldValue.serverTimestamp()
            }).then((function () {
                props.fetchUserPosts()
                props.navigation.popToTop()
            })).catch((error) => {
                setUploading(false)
                setError(true)

            })
    }
    return (
        <View style={[container.container, utils.backgroundBlack]}>
            {uploading ? (

                <View style={[container.container, utils.justifyCenter, utils.alignItemsCenter]}>
                    <ActivityIndicator style={utils.marginBottom} size="large" />
                    <Text style={[text.bold, text.large]}>Upload in progress...</Text>
                </View>
            ) : (
                    <View style={[container.container]}>
                        <View style={[container.container, utils.backgroundBlack, utils.padding15]}>
                            <View style={[container.horizontal, utils.justifyCenter, utils.alignItemsCenter]}>

                                {props.currentUser.image == 'default' ?
                                    (
                                        <FontAwesome5
                                            style={[utils.profileImageSmall]}
                                            name="user-circle" size={35} color="black"
                                        />

                                    )
                                    :
                                    (
                                        <Image
                                            style={[utils.profileImageSmall]}
                                            source={{
                                                uri: props.currentUser.image
                                            }}
                                        />
                                    )
                                }
                                <TextInput
                                    style={[container.fillHorizontal, container.input, container.container]}
                                    multiline={true}
                                    placeholder="Write a Caption . . ."
                                    onChangeText={(caption) => setCaption(caption)}
                                />
                                <SpotifyOAuth/>

                                <Image style={container.imageSmall} source={{ uri: props.route.params.image }} />
                            </View>
                        </View>
                        <Snackbar
                            visible={error}
                            duration={2000}
                            onDismiss={() => setError(false)}>
                            Something Went Wrong!
                        </Snackbar>
                    </View>
                )}

        </View>

    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})

const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserPosts }, dispatch);


export default connect(mapStateToProps, mapDispatchProps)(Save);