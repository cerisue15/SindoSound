import React, { useState, useEffect } from 'react'
import { View, Button, TextInput, Text, TouchableOpacity, Image } from 'react-native'
import { form, container, utils, text } from '../styles';
import { LinearGradient } from 'expo-linear-gradient';
import SpotifyOAuth from '../main/add/SpotifyOAuth'
import firebase from 'firebase'
require('firebase/firestore');

export default function Register(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

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
                                    postCount: 0,
                                })
                            props.navigation.navigate("Login")
                        })
                        .catch((error) => {
                            console.log(error)
                            setError(error.message)
                        })
                }
            }).catch((error) => {
                console.log(error)
                setError(error.message)
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

                <View style={{ marginBottom: 50, justifyContent: 'center'}}>
                    <Text style={[text.white, {textAlign: 'center', marginVertical: 15, fontSize: 20}]}>
                        Login to your Music Service(s)
                    </Text>

                    <View style={[utils.backgroundWhite, container.horizontal, { borderRadius: '35%',  height: 100, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                        <SpotifyOAuth/>
                        <TouchableOpacity 
                            disabled={true}
                            style={[{ height: '80%', marginHorizontal: 25 }]} 
                            onPress={() => {}}
                        >
                            <Image
                                style={[container.imageForGrid, {opacity: 0.5}]}
                                source={require('../../assets/tidal_icon.png')}
                            /> 
                        </TouchableOpacity>

                        <TouchableOpacity 
                            disabled={true}
                            style={[ { height: '75%', opacity: 0.5}]} 
                            onPress={() => {}}
                        >
                            <Image
                                style={container.imageForGrid}
                                source={require('../../assets/apple_icon.png')}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

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
                    style={form.authButton}
                    onPress={() => onRegister()}
                    title="Register"
                />

                <Text
                    style={[{color: 'red'}, text.center, {marginTop: 10}]}>
                    {error}
                </Text>
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

