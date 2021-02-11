import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import firebase from 'firebase'
require('firebase/firestore')

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUserChats } from '../../../redux/actions/index'

import { text, utils, container, navbar } from '../../styles'
import { timeDifference } from '../../utils'

function Chat(props) {
    const [user, setUser] = useState(props.route.params.user)
    const [chat, setChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [textInput, setTextInput] = useState(null)
    const [flatList, setFlatList] = useState(null)
    

    useEffect(() => {
        const chat = props.chats.find(el => el.users.includes(props.route.params.user.uid));
        setChat(chat)


        props.navigation.setOptions({
            headerTitle: () =>
                <View style={[container.horizontal, utils.alignItemsCenter]}>
                    {
                        props.route.params.user.image == 'default' ?
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
                    <Text style={[text.bold, text.large]}>{props.route.params.user.username}</Text>
                </View>
        });

        if (chat !== undefined) {
            firebase.firestore()
                .collection("chats")
                .doc(chat.id)
                .collection("messages")
                .orderBy("creation", "asc")
                .onSnapshot((snapshot) => {
                    let messages = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    console.log(messages)

                    setMessages(messages)
                })
        } else {
            createChat()
        }

    }, [props.route.params.user, props.chats])

    const createChat = () => {
        firebase.firestore()
            .collection("chats")
            .add({
                users: [firebase.auth().currentUser.uid, user.uid],
                lastMessage: 'Send the first message',
                lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                props.fetchUserChats()
            })
    }
    const onSend = () => {
        const textToSend = input;

        if(input.length == 0){
            return;
        }
        setInput("")

        textInput.clear()

        console.log(chat)
        firebase.firestore()
            .collection('chats')
            .doc(chat.id)
            .collection('messages')
            .add({
                creator: firebase.auth().currentUser.uid,
                text: textToSend,
                creation: firebase.firestore.FieldValue.serverTimestamp()
            })
        firebase.firestore()
            .collection('chats')
            .doc(chat.id)
            .update({
                lastMessage: textToSend,
                lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp()
            })

    }

    return (
        <View style={[container.container, container.alignItemsCenter, utils.backgroundBlack]}>
            <FlatList
                numColumns={1}
                horizontal={false}
                data={messages}
                ref={ref => setFlatList(ref)}
                onContentSizeChange={() => flatList.scrollToEnd({animated: true})}
                renderItem={({ item }) => (
                    <View style={[utils.padding10, container.container, item.creator == firebase.auth().currentUser.uid ? container.chatRight : container.chatLeft]}>
                        {item.creator !== undefined && item.creation !== null ?
                            <View style={container.horizontal}>
                                <View>
                                    <Text style={[utils.margin5Bottom, text.white]}>
                                        {item.text}
                                    </Text>
                                    <Text
                                        style={[text.grey, text.small, utils.margin5Bottom, text.whitesmoke]}>
                                        {timeDifference(new Date(), item.creation.toDate())}
                                    </Text>
                                </View>


                            </View>
                            : null}


                    </View>
                )
                }
            />

            < View style={[container.horizontal, utils.padding10, utils.alignItemsCenter, utils.backgroundBlack, utils.borderTopGray]} >
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
                    placeholder='Message...'
                    onChangeText={(input) => setInput(input)} />

                < TouchableOpacity
                    style={[container.horizontal, utils.padding15]}
                    onPress={() => onSend()}>
                    <View style={utils.justifyCenter}>
                        <Text style={[text.bold, text.medium, text.deepskyblue]} >Send</Text>
                    </View>
                </TouchableOpacity >
            </View >

        </View >
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    chats: store.userState.chats,
    following: store.userState.following,
    feed: store.usersState.feed,
    usersFollowingLoaded: store.usersState.usersFollowingLoaded,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserChats }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Chat);
