import React, { useState, useEffect } from 'react'
import { View, Text, Image, FlatList, RefreshControl, ScrollView, TouchableOpacity, Linking, ImageBackground } from 'react-native'
import Modal from 'react-native-modal';
import { FontAwesome5, Feather, Entypo, Ionicons } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'
import { text, utils, container, modal } from '../styles'
import { timeDifference } from '../utils'
import Share from './Share'

import { LinearGradient } from 'expo-linear-gradient';

function Post(props) {
    const [item, setItem] = useState(props.route.params.item)
    const [user, setUser] = useState(props.route.params.user)
    const [currentUserLike, setCurrentUserLike] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);

  
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

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

            <Text style={[text.white, text.bold, text.center, text.large, {paddingBottom: 10}]}>{item.playlistTitle}</Text>
            <View style={[container.horizontal]}>
                <ImageBackground
                    style= {[container.image]}
                    source={{ uri: item.downloadURL }}
                >
                    <View style={{backgroundColor:'black', opacity:0.6, width: '85%', height: '92.5%', alignSelf:'center', }}>
                        {/* <FlatList
                            numColumns={1}
                            horizontal={false}
                            data={comments}
                            renderItem={({ item }) => (
                                <View style={utils.padding10}>
                                
                                </View>
                            )}
                        /> */}
                    </View>
                </ImageBackground>
            </View>
            <View style={[utils.padding10, container.horizontal]}>
                {currentUserLike ?
                    (
                        <Entypo name="heart" size={30} color="red" onPress={() => onDislikePress(user.uid, item.id, item)} />
                    )
                    :
                    (
                        <Feather name="heart" size={30} color="white" onPress={() => onLikePress(user.uid, item.id, item)} />

                    )
                }
                <Feather style={utils.margin15Left} name="message-square" size={30} color="white" onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: user.uid })} />
                <Share imageUri={item.downloadURL}/>
            </View>

            <View style={[container.container, utils.padding10Sides]}>
                <Text style={[text.bold, text.medium, text.white]}>
                    {item.likesCount} likes
                            </Text>
                <Text style={[utils.margin15Right, utils.margin5Bottom, text.white]}>
                    <Text style={[text.bold, text.white]}
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

            {/* <Modal 
                isVisible={isModalVisible}
                backdropColor={"black"}
                backdropOpacity={0.1}>
                <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'}}>
                    <View style={[modal.modalContainer]}> 
                        <View style={utils.justifyCenter}>
                            <Text style={[text.bold, text.medium]} >Share Post</Text>
                        </View>

                        <View style={[container.horizontal]}> 
                            <TouchableOpacity onPress={sendSMS}>
                                <Image
                                    style={[ utils.profileImageBig ]}
                                    source={require('../../assets/imessage_share_icon_2.png')} 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {}}>
                                <Image
                                    style={[ utils.profileImageBig ]}
                                    source={require('../../assets/twitter_share_icon.png')}
                                />
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                    
                </View>
            </Modal> */}
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
