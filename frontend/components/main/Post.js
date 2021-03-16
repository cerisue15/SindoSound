import React, { useState, useEffect } from 'react'
import { 
    View, Text,  
    Image, FlatList, 
    Button, RefreshControl, 
    ScrollView, TouchableOpacity, 
    Linking, ImageBackground } from 'react-native'
import { FontAwesome5, Feather, Entypo, AntDesign } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'
import { text, utils, container, modal } from '../styles'
import { timeDifference } from '../utils'
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';
import {decode as atob, encode as btoa} from 'base-64'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env'

import Share from './Share'
// import Export from './Export'
import Modal from 'react-native-modal';


import { LinearGradient } from 'expo-linear-gradient';

function Post(props) {
    const [post, setPost] = useState(props.route.params.item)
    const [user, setUser] = useState(props.route.params.user)
    const [currentUserLike, setCurrentUserLike] = useState(false)
    const [tracks, setTracks] = useState([]);
    const [isExportModalVisible, setExportModalVisible] = useState(false);
    const [spotifyUser, setSpotifyUser] = useState(null);
    const [refreshToken, setRefreshToken] = useState('')
    const [token, setToken] = useState('');
    const [dialog, showDialog] = useState(false);

    const getSpotifyUser = async () => {
        const credsB64 = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
        axios('https://accounts.spotify.com/api/token',{
            method: 'post',
            headers: { 
                'Authorization': `Basic ${credsB64}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: `grant_type=refresh_token&refresh_token=${refreshToken}`
        })
        .then(tokenResponse => {
            setToken(tokenResponse.data.access_token)
            axios(`https://api.spotify.com/v1/me/`, {
                method: 'get',
                headers: { 'Authorization' : `Bearer ${tokenResponse.data.access_token}` }
            }) 
            .then (userResponse => {
                console.log(userResponse.data.id)
                setSpotifyUser(userResponse.data.id)
                axios(`https://api.spotify.com/v1/users/${userResponse.data.id}/playlists`, {
                    method: 'post',
                    headers: { 
                        'Authorization' : `Bearer ${tokenResponse.data.access_token}`,
                        'Content-Type' : 'application/json',
                        'Accept': 'application/json'
                    },
                    data: JSON.stringify({name: post.playlistTitle})
                }) 
                .then(createPlaylistResponse => {
                    console.log(createPlaylistResponse.data.id)
                    addTracksInSpotify(createPlaylistResponse.data.id, tokenResponse.data.access_token);
                    showDialog(true);
                })
            })
        })
        .catch(error => {
            console.log(error);
        })
    }

    const addTracksInSpotify = (playlistId, token) => {
        const uriList = tracks.map((track) => {
            return track.uri
        });

        axios(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'post',
            headers: { 
                'Authorization' : `Bearer ${token}`,
                'Content-Type' : 'application/json'
            },
            data: JSON.stringify({uris: uriList})
        }).then(() => {
            console.log('tracks added');
        }).catch(error => {
            console.log(error)
        })

    }

    const toggleModal = () => {
        setExportModalVisible(!isExportModalVisible);
    };

    useEffect(() => {
        async function getStorageValue() {
            const value = await SecureStore.getItemAsync('SPOTIFY_AUTH_KEY');
            setRefreshToken(value)
        }
        getStorageValue();

        firebase.firestore()
            .collection("posts")
            .doc(user.uid)
            .collection("userPosts")
            .doc(post.playlistId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .onSnapshot((snapshot) => {
                const postId = snapshot.ZE.path.segments[3];

                let currentUserLike = false;
                if (snapshot.exists) {
                    currentUserLike = true;
                }
                setCurrentUserLike(currentUserLike)

            })
        
        const trackList = [];
        console.log(user.uid)
        console.log(post.id)
        firebase.firestore()
            .collection("posts")
            .doc(user.uid)
            .collection("userPosts")
            .doc(post.id)
            .collection('tracks')
            .get()
            .then((snapshot) => {
                snapshot.forEach((track) => {
                    trackList.push(track.data());  
                });
                setTracks(trackList);
                // console.log(trackList)
            })

    }, [props.route.params.item])
    
    const onLikePress = (userId, postId, post) => {
        post.likesCount += 1;
        setCurrentUserLike(true)
        firebase.firestore()
            .collection("posts")
            .doc(userId)
            .collection("userPosts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .set({})
            .then()


    }
    const onDislikePress = (userId, postId, post) => {
        post.likesCount -= 1;
        setCurrentUserLike(false)

        firebase.firestore()
            .collection("posts")
            .doc(userId)
            .collection("userPosts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .delete()
    }
    return (
        <View style={[container.container, utils.backgroundBlack]}>
            <LinearGradient
                // Background Linear Gradient
                colors={['#2560F6', '#00FFF0','transparent']}
                style={utils.background}
            />

            <TouchableOpacity
                style={[container.horizontal, utils.padding15, {width: '100%'}, utils.borderBottomGray]}
                >
                {user.image == 'default' ?
                    (
                        <FontAwesome5
                            style={[utils.profileImageSmall, utils.marginBottomSmall]}
                            name="user-circle" size={35} color="black" />
                    )
                    :
                    (
                        <Image
                            style={[utils.profileImageSmall, utils.marginBottomSmall]}
                            source={{
                                uri: user.image
                            }}
                        />
                    )
                }
                <View style={[utils.justifyCenter]}>
                    <Text style={[text.bold, text.medium, text.white]} >{user.name}</Text>
                </View>
            </TouchableOpacity>

            <Text style={[text.white, text.bold, text.center, text.large, {paddingBottom: 10}]}>{post.playlistTitle}</Text>
            <View style={[container.horizontal]}>
                <ImageBackground
                    style= {[container.image]}
                    source={{ uri: post.downloadURL }}
                >
                    <View style={{backgroundColor:'black', opacity:0.75, width: '85%', height: '75%', justifyContent:'center', alignSelf:'center', }}>
                        <View style={[container.vertical]}>
                                <FlatList
                                    numColumns={1}
                                    horizontal={false}
                                    data={tracks}
                                    style={[utils.padding10Sides]}
                                    renderItem={({ item }) => (
                                        <>
                                        
                                        <TouchableOpacity
                                            style={[{marginVertical: 2, borderRadius: 5}, container.container, utils.borderWhite]}
                                            onPress={() => {}}>
                                            <ScrollView horizontal={true}>
                                                <View style={[container.row, {paddingHorizontal: 7.5, paddingVertical: 5, fontSize: 20}]}>
                                                    <Text style={[text.white, text.bold, { fontSize: 15}]}>{`${item.name} - `}</Text>
                                                    <Text style={[text.white, { fontSize: 15}]}>{`${item.artists[0].name}`}</Text>
                                                    {item.artists.length > 1 && (<Text style={[text.white, { fontSize: 15}]}>{` ft. `}</Text>)}
                                                    {item.artists.map((artist, index) => 
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
                </ImageBackground>
            </View>
            <View style={[utils.padding10, container.horizontal]}>
                {currentUserLike ?
                    (
                        <Entypo name="heart" size={30} color="red" onPress={() => onDislikePress(user.uid, post.playlistId, post)} />
                    )
                    :
                    (
                        <Feather name="heart" size={30} color="white" onPress={() => onLikePress(user.uid, post.playlistId, post)} />
                    )
                }
                <Feather style={utils.margin15Left} name="message-square" size={30} color="white" onPress={() => props.navigation.navigate('Comment', { postId: post.playlistId, uid: user.uid })} />
                {/* <Share imageUri={post.downloadURL}/> */}
                <Feather style={{ marginLeft: 15}} name="download" size={28} color="white" onPress={toggleModal} />
            </View>

            <View style={[container.container, utils.padding10Sides]}>
                <Text style={[text.bold, text.medium, text.white]}>
                    {post.likesCount} likes
                            </Text>
                <Text style={[utils.margin15Right, utils.margin5Bottom, text.white]}>
                    <Text style={[text.bold, text.white]}
                        onPress={() => props.navigation.navigate("Profile", { uid: user.uid })}>
                        {user.name}
                    </Text>
                    {" "}  {post.caption}
                </Text>
                <Text
                    style={[text.grey, utils.margin5Bottom]} onPress={() => props.navigation.navigate('Comment', { postId: post.playlistId, uid: user.uid })}>
                    View all {post.commentsCount} Comments
                            </Text>
                <Text
                    style={[text.grey, text.small, utils.margin5Bottom]}>
                    {timeDifference(new Date(), post.creation.toDate())}
                </Text>
            </View>
            
            {/* <Modal 
                isVisible={isModalVisible}
                backdropColor={"black"}
                backdropOpacity={0.1}>
                <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'}}>
                    
                    
                    <View style={[modal.modalContainer, {alignItems: 'center', padding: 15 }]}> 
                        <AntDesign style={{ marginHorizontal: 5, alignSelf: 'flex-end' }} name="close" size={20} color="red" onPress={() => setModalVisible(!isModalVisible)} />
                        
                        <Text style={[text.bold, text.medium]} >Share Post</Text>

                        <View style={[container.horizontal, { justifyContent: 'center', alignItems: 'center' }]}>
                            <TouchableOpacity 
                                style={[]} 
                                onPress={() => {
                                    getSpotifyUser();
                                }}
                            >
                                <Image
                                    style={utils.exportImage}
                                    source={require('../../assets/spotify_icon.png')}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{margin: 10}} 
                                onPress={() => getPlaylists('tidal')}
                            >
                                <Image
                                    style={utils.exportImage}
                                    source={require('../../assets/tidal_icon.png')}
                                /> 
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[]} 
                                onPress={() => getPlaylists('apple')}
                            >
                                <Image
                                    style={utils.exportImage}
                                    source={require('../../assets/apple_icon.png')}
                                />
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                    
                </View>
            </Modal> */}

            <Modal 
                isVisible={isExportModalVisible}
                backdropColor={"black"}
                backdropOpacity={0.1}>
                <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'}}>
                    
                    
                    <View style={[modal.modalContainer, {alignItems: 'center', padding: 15 }]}> 
                        <AntDesign style={{ marginHorizontal: 5, alignSelf: 'flex-end' }} name="close" size={20} color="red" onPress={() => {setExportModalVisible(!isExportModalVisible); showDialog(false);}} />
                        
                        <Text style={[text.bold, text.medium]} >Export Playlist to Music Service</Text>

                        <View style={[container.horizontal, { justifyContent: 'center', alignItems: 'center' }]}>
                            <TouchableOpacity 
                                style={[]} 
                                onPress={() => {
                                    getSpotifyUser();
                                }}
                            >
                                <Image
                                    style={utils.exportImage}
                                    source={require('../../assets/spotify_icon.png')}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                disabled={true}
                                style={{margin: 10, opacity: 0.5}} 
                                onPress={() => getPlaylists('tidal')}
                            >
                                <Image
                                    style={utils.exportImage}
                                    source={require('../../assets/tidal_icon.png')}
                                /> 
                            </TouchableOpacity>
                            <TouchableOpacity 
                                disabled={true}
                                style={[{opacity: 0.5}]} 
                                onPress={() => getPlaylists('apple')}
                            >
                                <Image
                                    style={utils.exportImage}
                                    source={require('../../assets/apple_icon.png')}
                                />
                            </TouchableOpacity>
                        </View>
                        {dialog && (<Text style={[text.bold, text.medium, {color: 'black'}]}>
                                        Spotify playlist was exported!
                                    </Text>)}
                    </View>
                    
                </View>
            </Modal>

        </View>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    following: store.userState.following,
    feed: store.usersState.feed,
    usersFollowingLoaded: store.usersState.usersFollowingLoaded,
})

export default connect(mapStateToProps, null)(Post);
