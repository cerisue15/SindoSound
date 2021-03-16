import React, { useState, useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';

import { text, utils, container } from '../../styles'

export default function Add({ navigation }) {
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [isDesktop, setIsDesktop] = useState(false);
  const [gallery, setGallery] = useState(false);


  useEffect(() => {
    (async () => {


      if (Device.brand == null) {
        setIsDesktop(true);
        return;
      }
      const cameraStatus = await Camera.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.requestCameraRollPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');




    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setImage(data.uri);
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };


  if (isDesktop) {
    return (
      <View style={container.form}>
        <Text style={text.notAvailable}>Can't use this functionality on Desktop</Text>
      </View>
    )
  }
  if (hasCameraPermission === null || hasGalleryPermission === false) {
    return <View />;
  }
  if (hasCameraPermission === false || hasGalleryPermission === false) {
    return <Text>No access to camera</Text>;
  }

  console.log(image)
  if (image !== null) {
    return (
      <View style={container.container}>
        <View style={container.camera}>
          <Image source={{ uri: image }} style={{ flex: 1 }} />
        </View>
        <View style={[container.horizontal, container.container, utils.centerHorizontal, utils.justifyCenter]}>

          <Feather style={utils.margin15} name="trash" size={50} color="black" onPress={() => setImage(null)} />
          <Feather style={utils.margin15} name="check" size={70} color="lightgreen" onPress={() => navigation.navigate('Save', { image })} />

        </View>
      </View>
    )
  }
  return (
    <View style={container.container}>
      <View style={container.camera}>
        <Camera
          ref={ref => setCamera(ref)}
          style={container.container}
          type={type}
          ratio={'1:1'} />
      </View>

      <View style={[container.horizontal, container.container, utils.centerHorizontal, utils.justifyCenter]}>
        <Feather name="rotate-ccw" size={50} color="black" onPress={() => {
          setType(
            type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
          );
        }} />

        <Feather style={utils.margin15} name="chrome" size={100} color="black" onPress={() => takePicture()} />
        <Feather name="image" size={50} color="black" onPress={() => pickImage()} />
      </View>
    </View>
  );
}
