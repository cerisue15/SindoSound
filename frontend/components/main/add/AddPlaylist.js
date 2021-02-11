import React, { useState, useEffect } from 'react';
import { Text, View, Image, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { text, utils, container } from '../../styles'
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux'
import SpotifyOAuth from './SpotifyOAuth'

import firebase from 'firebase'
import { TouchableOpacity } from 'react-native-gesture-handler';
require('firebase/firestore')

function AddPlaylists(props) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const { currentUser } = props;
        console.log(currentUser)
        
        setUser(currentUser)

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
            
            <View style={[utils.backgroundWhite, container.horizontal, { borderRadius: '35%', margin: 15, height: '17.5%', justifyContent: 'center', alignItems: 'center' }]}>
                <SpotifyOAuth/>
                <TouchableOpacity style={container.container, { height: '75%', margin: 10 }} onPress={() => getPlaylists('tidal')}>
                    <Image
                        style={container.imageForGrid}
                        source={require('../../../assets/tidal_icon.png')}
                    /> 
                </TouchableOpacity>

                <TouchableOpacity style={container.container, { height: '75%' }} onPress={() => getPlaylists('apple')}>
                    <Image
                        style={container.imageForGrid}
                        source={require('../../../assets/apple_icon.png')}
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                numColumns={3}
                horizontal={false}
                data={[]}
                style={[utils.marginBottomBar]}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[{marginHorizontal: 5},container.containerGridImage, utils.borderWhite]}
                        onPress={() => props.navigation.navigate("Post", { item, user })}>
                        <View style={[container.column]}>
                            <Text style={[text.white, text.bold, text.center, {paddingVertical: 10}]}>{item.playlistTitle}</Text>
                            <Image
                                style={container.imageForGrid}
                                source={{ uri: item.downloadURL }}
                            /> 
                            <View style={[container.row, { paddingVertical: 5 }]}>
                                <Entypo  name="controller-fast-backward" size={24} color="white" />
                                <FontAwesome style={{ marginHorizontal: 20 }} name="play" size={20} color="white" />
                                <Entypo  name="controller-fast-forward" size={24} color="white" />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})

export default connect(mapStateToProps, null)(AddPlaylists);
    