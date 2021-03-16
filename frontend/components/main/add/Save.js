import React, { useState, useLayoutEffect, useEffect } from 'react'
import { View, TextInput, Image, FlatList, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'
// import {  } from 'react-native-gesture-handler';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';


import axios from 'axios';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUserPosts } from '../../../redux/actions/index'
import * as AuthSession from 'expo-auth-session';

import firebase, { firestore } from 'firebase'
require("firebase/firestore")
require("firebase/firebase-storage")

import { container, utils, form, text, navbar } from '../../styles'
import * as Linking from 'expo-linking';

function Save(props) {

    const playlist = props.route.params.item;
    const token = props.route.params.token;

    const [caption, setCaption] = useState("")
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(false)
    const [tracks, setTracks] = useState([]);

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <Feather style={navbar.image} name="check" size={24} color="green" onPress={() => { uploadImage() }} />
            ),
        });

        getTracksFromPlaylist(token);
    }, [caption]); // caption

    const getTracksFromPlaylist = (token) => {
        // https://api.spotify.com/v1/playlists/{playlist_id}/tracks
        const apiUrl = playlist.tracks.href;

        axios(`${apiUrl}`, {
                method: 'get',
                headers: { 'Authorization' : `Bearer ${token}` }
            }) 
            .then (tracksResponse => {
                setTracks(tracksResponse.data.items)
            })
            .catch(error => {
                console.log(error);
            })
    }

    const uploadImage = async () => {
        let uri, response, blob;

        if (uploading) {
            return;
        }
        setUploading(true)
        if (playlist.images === undefined){
            blob = File('../../../assets/icon.png');
        }
        else{
            uri = playlist.images[0].url;
            response = await fetch(uri);
            blob = await response.blob();
        }
        const childPath = `post/${firebase.auth().currentUser.uid}/${Math.random().toString(36)}`;
        console.log(childPath)
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

    // save Playlist post
    const savePostData = (downloadURL) => {
        const tracksRef = 0;

        firebase.firestore()
            .collection('posts')
            .doc(firebase.auth().currentUser.uid)
            .collection("userPosts")
            .add({
                playlistId: playlist.id,
                playlistTitle: playlist.name,
                downloadURL,
                caption,
                likesCount: 0,
                commentsCount: 0,
                creation: firebase.firestore.FieldValue.serverTimestamp()

            }).then((docRef) => {
                // props.fetchUserPosts()
                setTracksInFS(docRef);
                // props.navigation.popToTop()
                
            }).catch((error) => {
                setUploading(false)
                setError(true)
                console.log(error)
            })
    }

    const setTracksInFS = (docRef) => {
        const batch = firebase.firestore().batch();
        tracks.forEach((item) => {
            let docRefr = firebase.firestore()
                .collection('posts')
                .doc(firebase.auth().currentUser.uid)
                .collection("userPosts")
                .doc(docRef.id)
                .collection('tracks')
                .doc(item.track.id);
            batch.set(docRefr, {
                name: item.track.name,
                artists: item.track.artists,
                href: item.track.href,
                uri: item.track.uri,
            });
        });
        batch.commit().then(() => {
            props.fetchUserPosts()
            props.navigation.popToTop()
            
        }).catch((error) => {
            setUploading(false)
            setError(true)
            console.log(error)
        })
    }

    return (
        <View style={[container.container, utils.backgroundBlack]}>
            <LinearGradient
                // Background Linear Gradient
                colors={['#2560F6', '#00FFF0','transparent']}
                style={utils.background}
            />

            {uploading ? (
                <View style={[container.container, utils.justifyCenter, utils.alignItemsCenter]}>
                    <ActivityIndicator style={utils.marginBottom} size="large" />
                    <Text style={[text.bold, text.large]}>Upload in progress...</Text>
                </View>
            ) : (
                    <View>
                        <View style={[container.vertical, utils.padding15]}>
                            <View style={[container.row, utils.justifyCenter, utils.alignItemsCenter]}>

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
                                <View style={[container.fillHorizontal, {maxHeight: 100, width: '75%'}, form.textInput]}>
                                    <TextInput
                                        style={[container.input, utils.backgroundWhite]}
                                        multiline={true}
                                        placeholder="Write a Caption . . ."
                                        onChangeText={(caption) => setCaption(caption)}
                                    />
                                </View>
                            </View>
                            <View style={[container.vertical]}>

                                <Text style={[{textAlign: 'center', marginBottom: 10},text.white, text.bold, { fontSize: 22.5}]}>{`${playlist.name}`}</Text>
                                
                                <Image style={[{ aspectRatio: 1/1}  ]} 
                                source={playlist.images !== undefined 
                                        ? { uri: playlist.images[0].url } 
                                        : require('../../../assets/icon.png')} />
                            </View>

                            <View style={[container.vertical, {marginTop: 20}]}>
                                <FlatList
                                    numColumns={1}
                                    horizontal={false}
                                    data={tracks}
                                    style={[]}
                                    renderItem={({ item }) => (
                                        <>
                                        
                                        <TouchableOpacity
                                            style={[{marginVertical: 2, borderRadius: 5}, container.container, utils.borderWhite]}
                                            onPress={() => {}}>
                                            <ScrollView horizontal={true}>
                                                <View style={[container.row, {paddingHorizontal: 7.5, paddingVertical: 5, fontSize: 20}]}>
                                                    <Text style={[text.white, text.bold, { fontSize: 15}]}>{`${item.track.name} - `}</Text>
                                                    <Text style={[text.white, { fontSize: 15}]}>{`${item.track.artists[0].name}`}</Text>
                                                    {item.track.artists.length > 1 && (<Text style={[text.white, { fontSize: 15}]}>{` ft. `}</Text>)}
                                                    {item.track.artists.map((artist, index) => 
                                                        index>0 && (<Text key={index} style={[text.white, { fontSize: 15}]}>{` ${artist.name}`}</Text>)
                                                    )}
                                            </View>    
                                            </ScrollView>
                                        </TouchableOpacity>
                                        </>
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                />
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