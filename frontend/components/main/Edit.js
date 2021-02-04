import React, { useState, useEffect, useLayoutEffect } from 'react'
import { View, TextInput, Text, Image, Button, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import firebase from 'firebase'
require('firebase/firestore')
import { connect } from 'react-redux'

import { container, form, utils, navbar, text } from '../styles'
const account = require('../../assets/account.svg')


function Edit(props) {
    const [name, setName] = useState(props.currentUser.name);
    const [description, setDescription] = useState(props.currentUser.description);
    const [image, setImage] = useState(props.currentUser.image);
    const [imageChanged, setImageChanged] = useState(false);
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

    console.log({ name })


    const onLogout = () => {
        firebase.auth().signOut();
    }


    useEffect(() => {
        (async () => {
            const galleryStatus = await ImagePicker.requestCameraRollPermissionsAsync();
            setHasGalleryPermission(galleryStatus.status === 'granted');


        })();
    }, []);

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (

                <Feather style={navbar.image} name="check" size={24} color="green" onPress={() => { console.log({ name, description }); Save() }} />
            ),
        });
    }, [props.navigation, name, description, image, imageChanged]);


    const pickImage = async () => {
        const galleryStatus = await ImagePicker.requestCameraRollPermissionsAsync();
        setHasGalleryPermission(galleryStatus.status === 'granted');

        if (hasGalleryPermission) {
            console.log("asd")
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            console.log(result);

            if (!result.cancelled) {
                setImage(result.uri);
                setImageChanged(true);
            }
        }
    };


    const Save = async () => {
        console.log({ imageChanged, image })
        if (imageChanged) {
            const uri = image;
            const childPath = `profile/${firebase.auth().currentUser.uid}`;
            console.log(childPath)

            const response = await fetch(uri);
            const blob = await response.blob();

            const task = firebase
                .storage()
                .ref()
                .child(childPath)
                .put(blob);

            const taskProgress = snapshot => {
                console.log(`transferred: ${snapshot.bytesTransferred}`)
            }

            const taskCompleted = () => {
                task.snapshot.ref.getDownloadURL().then((snapshot) => {

                    firebase.firestore().collection("users")
                        .doc(firebase.auth().currentUser.uid)
                        .update({
                            name,
                            description,
                            image: snapshot,
                        }).then(() => {
                            props.navigation.goBack()
                        })
                    console.log(snapshot)
                })
            }

            const taskError = snapshot => {
                console.log(snapshot)
            }

            task.on("state_changed", taskProgress, taskError, taskCompleted);
        } else {
            saveData({
                name,
                description,
            })
        }
    }

    const saveData = (data) => {
        firebase.firestore().collection("users")
            .doc(firebase.auth().currentUser.uid)
            .update(data).then(() => {
                props.navigation.goBack()
            })
    }

    return (
        <View style={container.form}>

            <TouchableOpacity style={[utils.centerHorizontal, utils.marginBottom]} onPress={() => pickImage()} >
                {image == 'default' ?
                    (
                        <Image
                            style={form.roundImage}
                            source={account}
                        />
                    )
                    :
                    (
                        <Image
                            style={form.roundImage}
                            source={{
                                uri: image
                            }}
                        />
                    )
                }
                <Text style={text.changePhoto}>Change Profile Photo</Text>
            </TouchableOpacity>

            <TextInput
                value={name}
                style={form.textInput}
                placeholder="Name"
                onChangeText={(name) => setName(name)}
            />
            <TextInput
                value={description}
                style={form.textInput}
                placeholder="Description"
                onChangeText={(description) => { setDescription(description); console.log(description) }}
            />
            <Button
                title="Logout"
                onPress={() => onLogout()} />
        </View>

    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
})
export default connect(mapStateToProps, null)(Edit);
