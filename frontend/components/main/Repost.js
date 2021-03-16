import React, { useState, useEffect } from 'react'
// import {  } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';


import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUserPosts } from '../../redux/actions/index'

import firebase, { firestore } from 'firebase'
require("firebase/firestore")
require("firebase/firebase-storage")

import { utils } from '../styles'

function Repost(props) {

    const playlist = props.playlist;
    console.log(playlist)
    const user = playlist.user.uid;

    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(false)
    const [tracks, setTracks] = useState([]);

    // getTracksFromPlaylist();

    const getTracksFromPlaylist = () => {
        const trackList = [];

        firebase.firestore()
            .collection("posts")
            .doc(playlist.user.uid)
            .collection("userPosts")
            .doc(playlist.playlistId)
            .collection('tracks')
            .get()
            .then((snapshot) => {
                snapshot.forEach((track) => {
                    trackList.push(track.data());
                    console.log(track) 
                });
                setTracks(tracksList)
            }).catch((err)=> {
                console.log(err)
            })
    }

    const uploadImage = async () => {
        getTracksFromPlaylist();
        let uri, response, blob;

        if (uploading) {
            return;
        }
        setUploading(true)
        if (playlist.image === undefined){
            blob = File('../../../assets/icon.png');
        }
        else{
            blob = playlist.image;
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
                playlistId: playlist.playlistId,
                playlistTitle: playlist.playlistTitle,
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
            // props.navigation.popToTop()
            
        }).catch((error) => {
            setUploading(false)
            setError(true)
            console.log(error)
        })
    }
    
    return (
        <>
            <FontAwesome style={utils.margin15Left} name="share" size={28} color="white" onPress={() => { uploadImage() }} />
        </>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})

const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserPosts }, dispatch);


export default connect(mapStateToProps, mapDispatchProps)(Repost);