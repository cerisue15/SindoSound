import React, { useState, useEffect } from 'react'
import { View, Button, TextInput, Text } from 'react-native'
import { form, container, utils, text } from '../styles';
import { LinearGradient } from 'expo-linear-gradient';


import firebase from 'firebase'
require('firebase/firestore');

export default function Register(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    const onRegister = () => {
        firebase.firestore()
            .collection('users')
            .where('username', '==', username)
            .get()
            .then((snapshot) => {

                if (!snapshot.exist) {
                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then(() => {
                            if (snapshot.exist) {
                                return
                            }
                            firebase.firestore().collection("users")
                                .doc(firebase.auth().currentUser.uid)
                                .set({
                                    name,
                                    email,
                                    username,
                                    image: 'default',
                                    followingCount: 0,
                                    followersCount: 0,

                                })
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }
            }).catch((error) => {
                console.log(error)
            })

    }

    return (
        <View style={[container.center, utils.backgroundBlack]}>

            <LinearGradient
                // Background Linear Gradient
                colors={['#2560F6', '#00FFF0','transparent']}
                style={utils.background}
            />
            <View style={container.formCenter}>
                <TextInput
                    style={form.textInput}
                    placeholder="username"
                    onChangeText={(username) => setUsername(username)}
                />
                <TextInput
                    style={form.textInput}
                    placeholder="name"
                    onChangeText={(name) => setName(name)}
                />
                <TextInput
                    style={form.textInput}
                    placeholder="email"
                    onChangeText={(email) => setEmail(email)}
                />
                <TextInput
                    style={form.textInput}
                    placeholder="password"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />

                <Button
                    style={form.button}
                    onPress={() => onRegister()}
                    title="Register"
                />
            </View>

            <View style={[form.bottomButton, { marginBottom: 50 }]} >
                <Text
                    style={text.white}
                    onPress={() => props.navigation.navigate("Login")} >
                    Already have an account? SignIn.
                </Text>
            </View>
        </View>

    )
}

