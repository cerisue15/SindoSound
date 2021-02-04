import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';

import firebase from 'firebase'
require('firebase/firestore')

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUsersData } from '../../redux/actions/index'
import { container, utils, text } from '../styles'
import { timeDifference } from '../utils'

function Comment(props) {
    const [comments, setComments] = useState([])
    const [postId, setPostId] = useState("")
    const [input, setInput] = useState("")
    const [refresh, setRefresh] = useState(false)
    const [textInput, setTextInput] = useState(null)

    useEffect(() => {
        getComments();
    }, [props.route.params.postId, props.users, refresh])

    const matchUserToComment = (comments) => {
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].hasOwnProperty('user')) {
                continue;
            }

            const user = props.users.find(x => x.uid === comments[i].creator)
            if (user == undefined) {
                props.fetchUsersData(comments[i].creator, false)
            } else {
                comments[i].user = user
            }
        }
        setComments(comments)
        setRefresh(false)
    }
    const getComments = () => {
        if (props.route.params.postId !== postId || refresh) {
            console.log(props.route.params.uid)
            console.log(props.route.params.postId)
            firebase.firestore()
                .collection('posts')
                .doc(props.route.params.uid)
                .collection('userPosts')
                .doc(props.route.params.postId)
                .collection('comments')
                .orderBy('creation', 'desc')
                .get()
                .then((snapshot) => {
                    let comments = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    matchUserToComment(comments)
                })
            setPostId(props.route.params.postId)
        } else {
            matchUserToComment(comments)
        }
    }
    const onCommentSend = () => {
        const textToSend = input;

        if(input.length == 0){
            return;
        }
        setInput("")

        textInput.clear()
        firebase.firestore()
            .collection('posts')
            .doc(props.route.params.uid)
            .collection('userPosts')
            .doc(props.route.params.postId)
            .collection('comments')
            .add({
                creator: firebase.auth().currentUser.uid,
                text: textToSend,
                creation: firebase.firestore.FieldValue.serverTimestamp()

            }).then(() => {
                setRefresh(true)
            })
    }

    return (
        <View style={[container.container, container.alignItemsCenter, utils.backgroundWhite]}>
            <FlatList
                numColumns={1}
                horizontal={false}
                data={comments}
                renderItem={({ item }) => (
                    <View style={utils.padding10}>
                        {item.user !== undefined ?
                            <View style={container.horizontal}>
                                {item.user.image == 'default' ?
                                    (
                                        <FontAwesome5
                                            style={[utils.profileImageSmall]}
                                            name="user-circle" size={35} color="black"
                                            onPress={() => props.navigation.navigate("Profile", { uid: item.user.uid })} />


                                    )
                                    :
                                    (
                                        <Image
                                            style={[utils.profileImageSmall]}
                                            source={{
                                                uri: item.user.image
                                            }}
                                            onPress={() => props.navigation.navigate("Profile", { uid: item.user.uid })} />

                                    )
                                }
                                <View>
                                    <Text style={[utils.margin15Right, utils.margin5Bottom]}>

                                        <Text style={[text.bold]}
                                            onPress={() => props.navigation.navigate("Profile", { uid: item.user.uid })}>
                                            {item.user.name}
                                        </Text>
                                        {" "}  {item.text}
                                    </Text>
                                    <Text
                                        style={[text.grey, text.small, utils.margin5Bottom]}>
                                        {timeDifference(new Date(), item.creation.toDate())}
                                    </Text>
                                </View>


                            </View>
                            : null}


                    </View>
                )
                }
            />

            < View style={[container.horizontal, utils.padding10, utils.alignItemsCenter, utils.backgroundWhite, utils.borderTopGray]} >
                {
                    props.currentUser.image == 'default' ?
                        (
                            <FontAwesome5
                                style={[utils.profileImageSmall]}
                                name="user-circle" size={35} color="black" />

                        )
                        :
                        (
                            <Image
                                style={[utils.profileImageSmall]}
                                source={{
                                    uri: props.currentUser.image
                                }}
                            />
                        )
                }
                < TextInput
                    ref={input => { setTextInput(input) }}
                    value={input}
                    style={[container.fillHorizontal]}
                    placeholder='comment...'
                    onChangeText={(input) => setInput(input)} />

                < TouchableOpacity
                    style={[container.horizontal, utils.padding15]}
                    onPress={() => onCommentSend()}>
                    <View style={utils.justifyCenter}>
                        <Text style={[text.bold, text.medium, text.deepskyblue]} >Post</Text>
                    </View>
                </TouchableOpacity >
            </View >

        </View >
    )
}


const mapStateToProps = (store) => ({
    users: store.usersState.users,
    currentUser: store.userState.currentUser
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
