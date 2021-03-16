import React, { useState, useEffect } from 'react'
import { View, Button, TextInput, Text, Image } from 'react-native'
import { form, container, utils, text } from '../styles'
import { LinearGradient } from 'expo-linear-gradient';

import firebase from 'firebase'



export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onSignUp = () => {
        setError('')

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((result) => {
                console.log(result)
            })
            .catch((error) => {
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

            <View style={[container.center, { justifyContent: "center", alignItems: 'center' }]}>
                <Image
                    source={require('../../assets/sindo_logo.png')}
                />
            </View>

            

            <View style={container.formCenter}>
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
                    onPress={() => onSignUp()}
                    title="Sign In"
                />

                <Text
                    style={[{color: 'red'}, text.center, {marginTop: 10}]}>
                    {error}
                </Text>
            </View>


            <View style={[form.bottomButton, {marginBottom: 50}]} >
                <Text
                    style={[text.white]}
                    title="Register"
                    onPress={() => props.navigation.navigate("Register")} >
                    Don't have an account? SignUp.
                    </Text>
            </View>
        </View>
    )
}

