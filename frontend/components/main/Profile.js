import React, { useState, useEffect } from 'react'
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'

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
        <View style={[container.container, utils.backgroundWhite]}>
            <View style={[navbar.custom, utils.justifyCenter]}>
                <Text style={navbar.title}>{user.username}</Text>
            </View>
            <View style={[container.profileInfo]}>

                <View style={[utils.noPadding, container.row]}>

                    {user.image == 'default' ?
                        (
                            <FontAwesome5
                                style={[utils.profileImageBig, utils.marginBottomSmall]}
                                name="user-circle" size={80} color="black" />
                        )
                        :
                        (
                            <Image
                                style={[utils.profileImageBig, utils.marginBottomSmall]}
                                source={{
                                    uri: user.image
                                }}
                            />
                        )
                    }

                    <View style={[container.container, container.horizontal, utils.justifyCenter, utils.padding10Sides]}>

                        <View style={[utils.justifyCenter, text.center, container.containerImage]}>
                            <Text style={[text.bold, text.large, text.center]}>{userPosts.length}</Text>
                            <Text style={[text.center]}>Posts</Text>
                        </View>
                        <View style={[utils.justifyCenter, text.center, container.containerImage]}>
                            <Text style={[text.bold, text.large, text.center]}>{user.followersCount}</Text>
                            <Text style={[text.center]}>Followers</Text>
                        </View>
                        <View style={[utils.justifyCenter, text.center, container.containerImage]}>
                            <Text style={[text.bold, text.large, text.center]}>{user.followingCount}</Text>
                            <Text style={[text.center]}>Following</Text>
                        </View>
                    </View>

                </View>


                <View>
                    <Text style={text.bold}>{user.name}</Text>
                    <Text style={[text.profileDescription, utils.marginBottom]}>{user.description}</Text>

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
                                        <Text style={[text.bold, text.center]}>Follow</Text>
                                    </TouchableOpacity>

                                )}

                            <TouchableOpacity
                                style={[utils.buttonOutlined, container.container]}
                                title="Follow"
                                onPress={() => props.navigation.navigate('Chat', {user})}>
                                <Text style={[text.bold, text.center]}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    ) :
                        <TouchableOpacity
                            style={utils.buttonOutlined}
                            onPress={() => props.navigation.navigate('Edit')}>
                            <Text style={[text.bold, text.center]}>Edit Profile</Text>
                        </TouchableOpacity>}
                </View>
            </View>



            <View style={[utils.borderTopGray]}>
                <FlatList
                    numColumns={3}
                    horizontal={false}
                    data={userPosts}
                    style={utils.marginBottomBar}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[container.containerImage, utils.borderWhite]}
                            onPress={() => props.navigation.navigate("Post", { item, user })}>

                            <Image
                                style={container.imageForGrid}
                                source={{ uri: item.downloadURL }}
                            />
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
