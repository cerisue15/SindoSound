import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';

import firebase from 'firebase'
require('firebase/firestore')

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUsersData } from '../../../redux/actions/index'

import { text, utils, container } from '../../styles'
import { timeDifference } from '../../utils'

function Chat(props) {
    const [chats, setChats] = useState([])
    useEffect(() => {
        console.log(props.chats)

        for (let i = 0; i < props.chats.length; i++) {
            if (props.chats[i].hasOwnProperty('otherUser')) {
                continue;
            }
            let otherUserId;
            if (props.chats[i].users[0] == firebase.auth().currentUser.uid) {
                otherUserId = props.chats[i].users[1];
            } else {
                otherUserId = props.chats[i].users[0];
            }

            const user = props.users.find(x => x.uid === otherUserId)
            if (user == undefined) {
                props.fetchUsersData(comments[i].creator, false)
            } else {
                props.chats[i].otherUser = user
            }
        }

        setChats(props.chats)

        console.log(props.chats)




    }, [props.chats, props.users])


    return (
        <View style={[container.container, container.alignItemsCenter, utils.backgroundWhite]}>
            <FlatList
                numColumns={1}
                horizontal={false}
                data={chats}
                renderItem={({ item }) => (

                    <View>
                        {item.otherUser == null ? (
                            <FontAwesome5
                                style={[utils.profileImageSmall]}
                                name="user-circle" size={35} color="black" />
                        )
                            :
                            (
                                <TouchableOpacity style={[utils.padding15, container.horizontal]}
                                    onPress={() => props.navigation.navigate("Chat", { user: item.otherUser })}>

                                    <View style={container.horizontal}>

                                        {item.otherUser.image == 'default' ? (
                                            <FontAwesome5
                                                style={[utils.profileImageSmall]}
                                                name="user-circle" size={35} color="black" />
                                        )
                                            :
                                            (
                                                <Image
                                                    style={[utils.profileImageSmall]}
                                                    source={{
                                                        uri: item.otherUser.image
                                                    }} />
                                            )}


                                    </View>

                                    <View>
                                        <Text style={[text.bold]}>{item.otherUser.name}</Text>

                                        <Text numberOfLines={1} ellipsizeMode='tail' style={[utils.margin15Right, utils.margin5Bottom]}>
                                            {item.lastMessage} {" "}
                                            {item.lastMessageTimestamp == null ? (

                                                <Text style={[text.grey, text.small, utils.margin5Bottom]}>Now</Text>
                                            ) : (
                                                    <Text
                                                        style={[text.grey, text.small, utils.margin5Bottom]}>
                                                        {timeDifference(new Date(), item.lastMessageTimestamp.toDate())}
                                                    </Text>
                                                )}
                                        </Text>
                                    </View>


                                </TouchableOpacity>
                            )}

                    </View>

                )
                }
            />
        </View >
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    chats: store.userState.chats,
    users: store.usersState.users,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Chat);
