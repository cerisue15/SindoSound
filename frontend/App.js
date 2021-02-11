import React, { Component } from 'react';
import { Image } from 'react-native'

import * as Linking from 'expo-linking';
// import {AuthSession} from 'expo'
// console.log(AuthSession.getRedirectUrl())

import * as firebase from 'firebase'

import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './redux/reducers'
import thunk from 'redux-thunk'

import { container } from './components/styles'

const store = createStore(rootReducer, applyMiddleware(thunk))

console.disableYellowBox = true;

const firebaseConfig = {
  apiKey: "AIzaSyCJCTEz6cT2aThg13Bw_p3ZyI9vuuyu5Fg",
  authDomain: "sindosound-4d6fd.firebaseapp.com",
  databaseURL: "https://sindosound-4d6fd.firebaseio.com",
  projectId: "sindosound-4d6fd",
  storageBucket: "sindosound-4d6fd.appspot.com",
  messagingSenderId: "966426368081",
  appId: "1:966426368081:web:dd3f75e97eda2d219ec070",
  measurementId: "G-F90VCHPTM0"
};

const logo = require('./assets/logo.png')

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

// firebase.auth().signOut();

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RegisterScreen from './components/auth/Register'
import LoginScreen from './components/auth/Login'
import MainScreen from './components/Main'
import AddScreen from './components/main/add/Add'
import AddPlaylistScreen from './components/main/add/AddPlaylist'
import SaveScreen from './components/main/add/Save'
import EditScreen from './components/main/Edit'
import ChatScreen from './components/main/chat/Chat'
import ChatListScreen from './components/main/chat/List'
import CommentScreen from './components/main/Comment'
import PostScreen from './components/main/Post'

const Stack = createStackNavigator();

export class App extends Component {
  constructor(props) {
    super()
    this.state = {
      loaded: false,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        })
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        })
      }
    })
  }
  render() {
    // Main deep link --> exp://192.168.1.20:19000/
    const { loggedIn, loaded } = this.state;

    if (!loaded) {
      return (
        <Image style={container.splash} source={logo} />
      )
    }

    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Register" component={RegisterScreen} navigation={this.props.navigation} options={{ headerShown: false }} />
            <Stack.Screen name="Login" navigation={this.props.navigation} component={LoginScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    
    return (
      <Provider store={store}>
        <NavigationContainer>
        {/* <NavigationContainer> */}
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="Add" component={AddScreen} navigation={this.props.navigation} /> */}
            <Stack.Screen name="AddPlaylist" component={AddPlaylistScreen} navigation={this.props.navigation}/>
            <Stack.Screen name="Save" component={SaveScreen} navigation={this.props.navigation} />
            <Stack.Screen name="Post" component={PostScreen} navigation={this.props.navigation} />
            <Stack.Screen name="Chat" component={ChatScreen} navigation={this.props.navigation}/>
            <Stack.Screen name="ChatList" component={ChatListScreen} navigation={this.props.navigation} />
            <Stack.Screen name="Edit" component={EditScreen} navigation={this.props.navigation} />
            <Stack.Screen name="Comment" component={CommentScreen} navigation={this.props.navigation} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    )
  }
}

export default App;