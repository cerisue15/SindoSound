import React, { useState, useEffect } from 'react'
import { View, Text, Image, FlatList, RefreshControl, ScrollView, TouchableOpacity } from 'react-native'
import { FontAwesome5, Feather, Entypo } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { reload } from '../../redux/actions/index'
import { text, utils, container, navbar } from '../styles'
import { timeDifference } from '../utils'

function Feed(props) {
    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
            props.feed.sort(function (x, y) {
                return y.creation.toDate() - x.creation.toDate();
            })

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
    return (
        <View style={[container.container, utils.backgroundWhite]}>
            <View style={[navbar.custom, utils.alignItemsCenter, container.horizontal]}>
                <Text style={[navbar.title, container.fillHorizontal]}>Instagram</Text>
                <Feather name="send" size={30} color="black"
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
                            style={[container.horizontal, utils.padding15]}
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
                            <View style={utils.justifyCenter}>
                                <Text style={[text.bold, text.medium]} >{item.user.name}</Text>
                            </View>
                        </TouchableOpacity>
                        <Image
                            style={container.image}
                            source={{ uri: item.downloadURL }}
                        />

                        <View style={[container.container, utils.padding10, container.horizontal]}>
                            {item.currentUserLike ?
                                (
                                    <Entypo name="heart" size={30} color="red" onPress={() => onDislikePress(item.user.uid, item.id, item)} />
                                )
                                :
                                (
                                    <Feather name="heart" size={30} color="black" onPress={() => onLikePress(item.user.uid, item.id, item)} />

                                )
                            }
                            <Feather style={utils.margin15Left} name="message-square" size={30} color="black" onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: item.user.uid })} />
                        </View>
                        <View style={[container.container, utils.padding10Sides]}>
                            <Text style={[text.bold, text.medium]}>
                                {item.likesCount} likes
                                </Text>
                            <Text style={[utils.margin15Right, utils.margin5Bottom]}>
                                <Text style={[text.bold]}
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
