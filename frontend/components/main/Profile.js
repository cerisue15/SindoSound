import React, { useState, useEffect } from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, ImageBackground } from 'react-native'
import { FontAwesome, Entypo, FontAwesome5 } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'

import { LinearGradient } from 'expo-linear-gradient';
import { text, utils, container, navbar } from '../styles'

function Profile(props) {
    const [userPosts, setUserPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [following, setFollowing] = useState(false)

    useEffect(() => {
        const { currentUser, posts } = props;

        if (props.route.params.uid === firebase.auth().currentUser.uid) {
            setUser(currentUser)
            setUserPosts(posts)
        }
        else {
            firebase.firestore()
                .collection("users")
                .doc(props.route.params.uid)
                .get()
                .then((snapshot) => {
                    if (snapshot.exists) {
                        setUser({ uid: props.route.params.uid, ...snapshot.data() });
                    }
                    else {
                        console.log('does not exist')
                    }
                })
            firebase.firestore()
                .collection("posts")
                .doc(props.route.params.uid)
                .collection("userPosts")
                .orderBy("creation", "desc")
                .get()
                .then((snapshot) => {
                    let posts = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    setUserPosts(posts)
                })
        }

        if (props.following.indexOf(props.route.params.uid) > -1) {
            setFollowing(true);
        } else {
            setFollowing(false);
        }

    }, [props.route.params.uid, props.following, props.currentUser, props.posts])

    const onFollow = () => {
        firebase.firestore()
            .collection("following")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowing")
            .doc(props.route.params.uid)
            .set({})
    }
    const onUnfollow = () => {
        firebase.firestore()
            .collection("following")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowing")
            .doc(props.route.params.uid)
            .delete()
    }
    
    if (user === null) {
        return (
            <View style={container.form}>
                <Text style={text.notAvailable}>User Not Found</Text>
            </View>
        )
    }
    return (
        <View style={[container.container, utils.backgroundBlack]}>
            
            <LinearGradient
                // Background Linear Gradient
                colors={['#2560F6', '#00FFF0','transparent']}
                style={utils.background}
            />

            <ImageBackground
                style={{
                    marginTop: 50,
                    height: 50,
                    justifyContent: 'center'
                }}
                source={require('../../assets/diamond-gradient.png')}>
                <Text style={[text.top5, text.white]}>Song Titles of Top 5</Text>
            </ImageBackground>

            <View style={[container.profileInfo]}>
                <View style={[utils.padding20Vertical, container.row, utils.borderTopGray]}>

                    <View style={[container.container, container.horizontal, utils.justifyCenter]}>
                        
                        <View style={[utils.justifyCenter, text.center, container.container]}>
                            <Text style={[text.bold, text.white, text.large, text.center]}>{user.followersCount}</Text>
                            <Text style={[text.center, text.white]}>Followers</Text>
                        </View>

                        <View style={[utils.justifyCenter, container.column, utils.padding30Sides]}>
                            {user.image == 'default' ?
                                (
                                    <FontAwesome5
                                        style={[utils.profileImageBig, utils.marginBottomSmall]}
                                        name="user-circle" size={80} color="black" />
                                ):(
                                    <Image
                                        style={[utils.profileImageBig, utils.marginBottomSmall]}
                                        source={{
                                            uri: user.image
                                        }}
                                    />
                                )
                            }
                            <Text style={[navbar.title, text.white]}>{user.username}</Text>
                        </View>

                        <View style={[utils.justifyCenter, text.center, container.container]}>
                            <Text style={[text.bold, text.white, text.large, text.center]}>{user.followingCount}</Text>
                            <Text style={[text.center, text.white]}>Following</Text>
                        </View>
                    </View>

                </View>
                
                <View style={[utils.borderTopGray, {width: '100%'}]}>
                    <Text style={[text.bold, text.white, {marginTop: 15}]}>{user.name}</Text>
                    <Text style={[text.white, text.profileDescription, utils.marginBottom]}>{user.description}</Text>

                    {props.route.params.uid !== firebase.auth().currentUser.uid ? (
                        <View style={[container.horizontal]}>
                            {following ? (
                                <TouchableOpacity
                                    style={[utils.buttonOutlined, container.container, utils.margin15Right]}
                                    title="Following"
                                    onPress={() => onUnfollow()}>
                                    <Text style={[text.bold, text.center, text.green]}>Following</Text>
                                </TouchableOpacity>
                            )
                                :
                                (
                                    <TouchableOpacity
                                        style={[utils.buttonOutlined, container.container, utils.margin15Right]}
                                        title="Follow"
                                        onPress={() => onFollow()}>
                                        <Text style={[text.bold, text.center, text.white]}>Follow</Text>
                                    </TouchableOpacity>

                                )}

                            <TouchableOpacity
                                style={[utils.buttonOutlined, container.container]}
                                title="Follow"
                                onPress={() => props.navigation.navigate('Chat', {user})}>
                                <Text style={[text.bold, text.center, text.white]}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    ) :
                        <TouchableOpacity
                            style={utils.buttonOutlined}
                            onPress={() => props.navigation.navigate('Edit')}>
                            <Text style={[text.bold, text.center, text.white]}>Edit Profile</Text>
                        </TouchableOpacity>}
                </View>
            </View>



            <View>
                <FlatList
                    numColumns={3}
                    horizontal={false}
                    data={userPosts}
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
        </View >

    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts,
    following: store.userState.following
})
export default connect(mapStateToProps, null)(Profile);
