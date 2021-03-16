import React, { useState, useEffect } from 'react'
import { View, Text, Image, FlatList, RefreshControl, ImageBackground, TouchableOpacity, ScrollView } from 'react-native'
import { FontAwesome5, Feather, Entypo, AntDesign, SimpleLineIcons, MaterialIcons } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';
import {decode as atob, encode as btoa} from 'base-64'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env'

import { bindActionCreators } from 'redux'
import { reload } from '../../redux/actions/index'
import { text, utils, container, navbar, modal } from '../styles'
import { timeDifference } from '../utils'
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import Share from './Share'
import Repost from './Repost'
import { Button } from 'react-native';



function Feed(props) {

    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false)
    const [isExportModalVisible, setExportModalVisible] = useState(false);
    const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);
    const [postTouched, setPostTouched] = useState(undefined);
    const [tracks, setTracks] = useState([]);
    const [dialog, showDialog] = useState(false);

    useEffect(() => {
        
        console.log('followingLoad', props.usersFollowingLoaded)
        console.log('following', props.following.length)

        if (props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
            props.feed.sort(function (x, y) {
                return y.creation.toDate() - x.creation.toDate();
            })

            console.log('Feed', props.feed)

            setPosts(props.feed);
            setRefreshing(false)
        }

    }, [props.usersFollowingLoaded, props.feed])

    const onLikePress = (userId, postId, item) => {
        item.likesCount += 1;
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
    const onDislikePress = (userId, postId, item) => {
        item.likesCount -= 1;
        firebase.firestore()
            .collection("posts")
            .doc(userId)
            .collection("userPosts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .delete()
    }

    const getTracks = (playlist) =>{
        // setButtonVisible(!isButtonVisible);

        const trackList = [];
        firebase.firestore()
            .collection("posts")
            .doc(playlist.user.uid)
            .collection("userPosts")
            .doc(playlist.id)
            .collection('tracks')
            .get()
            .then((snapshot) => {
                snapshot.forEach((track) => {
                    trackList.push(track.data());  
                });
                setTracks(trackList);
                return trackList;
            })
    }
    

    const getSpotifyUser = async (playlist) => {
        console.log(playlist)
        const refresh_token = await SecureStore.getItemAsync('SPOTIFY_AUTH_KEY');
        console.log(refresh_token)
        
        const trackList = [];
        firebase.firestore()
            .collection("posts")
            .doc(playlist.user.uid)
            .collection("userPosts")
            .doc(playlist.id)
            .collection('tracks')
            .get()
            .then((snapshot) => {
                snapshot.forEach((track) => {
                    trackList.push(track.data());  
                });
            }).catch((err)=> {
                console.log(err)
            })

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
            axios(`https://api.spotify.com/v1/me/`, {
                method: 'get',
                headers: { 'Authorization' : `Bearer ${tokenResponse.data.access_token}` }
            }) 
            .then (userResponse => {
                axios(`https://api.spotify.com/v1/users/${userResponse.data.id}/playlists`, {
                    method: 'post',
                    headers: { 
                        'Authorization' : `Bearer ${tokenResponse.data.access_token}`,
                        'Content-Type' : 'application/json',
                        'Accept': 'application/json'
                    },
                    data: JSON.stringify({name: playlist.playlistTitle})
                }) 
                .then(createPlaylistResponse => {
                    addTracksInSpotify(createPlaylistResponse.data.id, tokenResponse.data.access_token, trackList);
                    showDialog(true);
                })
            })
        })
        .catch(error => {
            console.log(error);
        })
    }

    const addTracksInSpotify = (playlistId, token, tracks) => {
        const uriList = tracks.map((track) => {
            return track.uri
        });
        const uriString = uriList.join(',');

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

    const toggleExport = (post) => {
        setPostTouched(post)
        setExportModalVisible(!isExportModalVisible);
    };

    const togglePlaylist = (post) => {
        getTracks(post)
        setPlaylistModalVisible(!isPlaylistModalVisible);
    };

    return (
        <View style={[container.container, utils.backgroundBlack]}>

            <LinearGradient
                // Background Linear Gradient
                colors={['#2560F6', '#00FFF0','transparent']}
                style={utils.background}
            />
            <View style={[navbar.custom, utils.alignItemsCenter, container.horizontal, {borderBottomWidth: 0.25, borderBottomColor: 'black'}]}>
                <Text style={[navbar.title]}>Sindo Sound</Text>
                <Feather name="send" size={30} color="white" style={{ marginLeft: 'auto' }}
                    onPress={() => props.navigation.navigate("ChatList")}
                />
            </View>


            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            props.reload()
                        }}
                    />
                }
                numColumns={1}
                horizontal={false}
                data={posts}
                renderItem={({ item }) => (
                    <View
                        style={container.containerImage}>
                        <TouchableOpacity
                            style={[container.horizontal, utils.padding15, utils.borderBottomGray, {borderBottomColor: 'white'}]}
                            onPress={() => props.navigation.navigate("Profile", { uid: item.user.uid })}>

                            {item.user.image == 'default' ?
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
                                            uri: item.user.image
                                        }}
                                    />
                                )
                            }
                            <View style={[{alignItems:'center'}, container.horizontal, container.container]}>
                                <Text style={[text.bold, text.medium, text.white]}> {item.user.name}</Text>
                                <SimpleLineIcons style={{marginLeft: 'auto'}} name="options-vertical" size={20} color="white" onPress={() => {}} />
                            </View>
                        </TouchableOpacity>

                        <Text style={[text.white, text.bold, text.center, text.large, {paddingBottom: 10}]}>{item.playlistTitle}</Text>
                        <View style={[container.horizontal]}>
                            <ImageBackground
                                style={container.image}
                                source={{ uri: item.downloadURL }}
                            />
                        </View>

                        <View style={[container.container, utils.padding10, container.horizontal]}>
                            {item.currentUserLike ?
                                (
                                    <Entypo name="heart" size={30} color="red" onPress={() => onDislikePress(item.user.uid, item.id, item)} />
                                )
                                :
                                (
                                    <Feather name="heart" size={30} color="white" onPress={() => onLikePress(item.user.uid, item.id, item)} />

                                )
                            }
                            <Feather style={utils.margin15Left} name="message-square" size={30} color="white" onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: item.user.uid })} />
                            {/* <Share imageUri={item.downloadURL}/> */}
                            {/* <Repost playlist={item}/> */}
                            <Feather style={utils.margin15Left} name="download" size={28} color="white" onPress={() => toggleExport(item)} />
                            <MaterialIcons style={{marginLeft: 'auto'}} name="playlist-play" size={28} color="white" onPress={() => togglePlaylist(item)} />
                        </View>
                        <View style={[container.container, utils.padding10Sides]}>
                            <Text style={[text.bold, text.medium, text.white]}>
                                {item.likesCount} likes
                            </Text>
                            <Text style={[utils.margin15Right, utils.margin5Bottom, text.white]}>
                                <Text style={[text.bold, text.white]}
                                    onPress={() => props.navigation.navigate("Profile", { uid: item.user.id })}>
                                    {item.user.name}
                                </Text>
                                {" "}  {item.caption}
                            </Text>
                            <Text
                                style={[text.grey, utils.margin5Bottom]} onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: item.user.uid })}>
                                View all {item.commentsCount} Comments
                                </Text>
                            <Text
                                style={[text.grey, text.small, utils.margin5Bottom]}>
                                {timeDifference(new Date(), item.creation.toDate())}
                            </Text>
                        </View>
                    </View>
                )}
            />

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
                                    getSpotifyUser(postTouched);
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

            <Modal 
                isVisible={isPlaylistModalVisible}
                animationType={"slide"}
                backdropColor={"black"}
                backdropOpacity={0.1}>
                <View style={{backgroundColor:'black', opacity:0.85, width: '85%', height: '30%', borderRadius: 20, justifyContent:'center', alignSelf:'center', marginBottom: 5}}>
                    <View style={[container.row,{ marginHorizontal: 10 }]}>
                        <AntDesign style={{ marginLeft:'auto' }} name="close" size={20} color="red" onPress={() => setPlaylistModalVisible(!isPlaylistModalVisible)} />
                    </View>

                    <View style={[container.vertical]}>
                            <FlatList
                                numColumns={1}
                                horizontal={false}
                                data={tracks}
                                style={[utils.padding10Sides]}
                                renderItem={({ item }) => (
                                    <>
                                    
                                    <TouchableOpacity
                                        style={[{marginVertical: 2, borderRadius: 5}, utils.borderWhite]}
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

const mapDispatchProps = (dispatch) => bindActionCreators({ reload }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Feed);
