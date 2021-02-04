import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList, RefreshControl, ScrollView, TouchableOpacity } from 'react-native'
import { FontAwesome5, Feather, Entypo } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'
import { text, utils, container, navbar } from '../styles'
import { timeDifference } from '../utils'

function Post(props) {
    const [item, setItem] = useState(props.route.params.item)
    const [user, setUser] = useState(props.route.params.user)
    const [currentUserLike, setCurrentUserLike] = useState(false)

    console.log({ item, user })


    useEffect(() => {
        firebase.firestore()
            .collection("posts")
            .doc(user.uid)
            .collection("userPosts")
            .doc(item.id)
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
    }, [props.route.params.item])
    
    const onLikePress = (userId, postId, item) => {
        item.likesCount += 1;
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
    const onDislikePress = (userId, postId, item) => {
        item.likesCount -= 1;
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
        <View style={[container.container, utils.backgroundWhite]}>
            <TouchableOpacity
                style={[container.horizontal, utils.padding15]}
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
                <View style={utils.justifyCenter}>
                    <Text style={[text.bold, text.medium]} >{user.name}</Text>
                </View>
            </TouchableOpacity>

            <View style={[container.horizontal]}>
                <Image
                    style= {[container.image]}
                    source={{ uri: item.downloadURL }}
                />
            </View>

            <View style={[utils.padding10, container.horizontal]}>
                {currentUserLike ?
                    (
                        <Entypo name="heart" size={30} color="red" onPress={() => onDislikePress(user.uid, item.id, item)} />
                    )
                    :
                    (
                        <Feather name="heart" size={30} color="black" onPress={() => onLikePress(user.uid, item.id, item)} />

                    )
                }
                <Feather style={utils.margin15Left} name="message-square" size={30} color="black" onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: user.uid })} />
            </View>

            <View style={[container.container, utils.padding10Sides, { marginTop: 20}]}>
                <Text style={[text.bold, text.medium]}>
                    {item.likesCount} likes
                            </Text>
                <Text style={[utils.margin15Right, utils.margin5Bottom]}>
                    <Text style={[text.bold]}
                        onPress={() => props.navigation.navigate("Profile", { uid: user.uid })}>
                        {user.name}
                    </Text>
                    {" "}  {item.caption}
                </Text>
                <Text
                    style={[text.grey, utils.margin5Bottom]} onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: user.uid })}>
                    View all {item.commentsCount} Comments
                            </Text>
                <Text
                    style={[text.grey, text.small, utils.margin5Bottom]}>
                    {timeDifference(new Date(), item.creation.toDate())}
                </Text>
            </View>
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
