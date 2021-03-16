import React, { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native'
import { FontAwesome5, MaterialCommunityIcons, Entypo, FontAwesome } from '@expo/vector-icons';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env'
import { encode as btoa } from 'base-64';
import firebase from 'firebase';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux'

require('firebase/firestore');

import { navbar, utils, text, container } from '../styles'

function Search(props) {
    const [users, setUsers] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [isModalVisible, setModalVisible] = useState(false);
    const refreshToken = 'AQCKHqvQL1n3cYM2HLdwqv7HJzee_CQzc6fUHRu6xVz2oA5UBL5L1FTXpQgHo1HSj-itbVcwOOMgnfW-xNkuXqwJ8xOFyJQmzW1nnjcuWOp3waaEJmnaDnRMxwMn0NIipBI'

    const toggleResults = () => {
        setModalVisible(!isModalVisible);
    };

    const fetchUsers = (search) => {
        firebase.firestore()
            .collection('users')
            .where('username', '>=', search)
            .get()
            .then((snapshot) => {
                let users = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                });
                setUsers(users);
            })
    }
    

    const getSpotifyPlaylists = () => {

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
            // console.log(tokenResponse);

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

    getSpotifyPlaylists();

    return (
        <View style={[utils.backgroundBlack, container.container]}>

            <LinearGradient
                // Background Linear Gradient
                colors={['#2560F6', '#00FFF0','transparent']}
                style={utils.background}
            />

            <View style={[navbar.custom, {flexDirection: 'row'}]}>
                <TextInput
                    clearTextOnFocus
                    style={[utils.searchBar, {width: '90%'}]}
                    placeholder="Type Here..."
                    onChangeText={(search) => fetchUsers(search)} />
                {!isModalVisible && <MaterialCommunityIcons
                    style={[{ marginLeft: 'auto' }]}
                    name="magnify" size={28} color="white" 
                    onPress={toggleResults}/>}
                {isModalVisible && <MaterialCommunityIcons
                    style={[{ marginLeft: 'auto' }]}
                    name="close" size={28} color="white" 
                    onPress={toggleResults}/>}
            </View>


            {isModalVisible && (<FlatList
                numColumns={1}
                horizontal={false}
                data={users}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[container.horizontal, utils.padding10Sides, utils.padding10Top]}
                        onPress={() => props.navigation.navigate("Profile", { uid: item.id })}>

                        {item.image == 'default' ?
                            (
                                <FontAwesome5
                                    style={[utils.profileImage, utils.marginBottomSmall, { marginRight: 15 }]}
                                    name="user-circle" size={50} color="black" />

                            )
                            :
                            (
                                <Image
                                    style={[utils.profileImage, utils.marginBottomSmall, { marginRight: 15 }]}
                                    source={{
                                        uri: item.image
                                    }}
                                />
                            )
                        }
                        <View style={utils.justifyCenter}>
                            <Text style={text.username}>{item.username}</Text>
                            <Text style={text.name} >{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />)}

            
            {!isModalVisible && (
            <View style={{marginTop: 50, paddingHorizontal: 15}}>

                <Text style={[text.white, text.bold, {textAlign: 'center', marginBottom: 50, fontSize: 50}]}>
                    What's Hot?
                </Text>

                <Text style={[text.white, text.bold, {textAlign: 'left', marginVertical: 15, fontSize: 20}]}>
                    Spotify Playlists
                </Text>

                    <FlatList
                        horizontal={true}
                        data={playlists}
                        style={[]}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                // disabled={fa}
                                style={[{marginHorizontal: 4},container.containerGridImage, utils.borderWhite]}
                                onPress={() => Linking.openURL(`spotify:playlist:${item.id}`)}>
                                <View style={[container.column]}>
                                    <Text style={[text.white, text.bold, text.center, {paddingVertical: 10}]}>{item.name.length > 15 ? `${item.name.slice(0, 15)} ...` : item.name}</Text>
                                    <Image
                                        style={[container.imageForHorizontalScroll]}
                                        source={item.images[0] !== undefined 
                                            ? { uri: item.images[0].url } 
                                            : require('../../assets/icon.png')}
                                    /> 
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    )
}

export default connect(null, null)(Search);