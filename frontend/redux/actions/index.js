import {
    USER_STATE_CHANGE
    , USER_POSTS_STATE_CHANGE
    , USER_FOLLOWING_STATE_CHANGE
    , USER_FOLLOWERS_STATE_CHANGE
    , USERS_DATA_STATE_CHANGE
    , USERS_POSTS_STATE_CHANGE
    , USERS_LIKES_STATE_CHANGE
    , USER_CHATS_STATE_CHANGE
    , CLEAR_DATA
} from '../constants/index'
import firebase from 'firebase'
require('firebase/firestore')


export function clearData() {
    return ((dispatch) => {
        dispatch({ type: CLEAR_DATA })
    })
}
export function reload() {
    return ((dispatch) => {
        dispatch(clearData())
        dispatch(fetchUser())
        dispatch(fetchUserPosts())
        dispatch(fetchUserFollowing())
        dispatch(fetchUserFollowers())
        dispatch(fetchUserChats())

    })
}
export function fetchUser() {
    return ((dispatch) => {
        firebase.firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .onSnapshot((snapshot, error) => {
                console.log("fetchUser -> error", error)

                if (snapshot.exists) {

                    dispatch({ type: USER_STATE_CHANGE, currentUser: { uid: firebase.auth().currentUser.uid, ...snapshot.data() } })
                }
            })
    })
}

export function fetchUserChats() {
    return ((dispatch) => {
        firebase.firestore()
            .collection("chats")
            .where("users", "array-contains", firebase.auth().currentUser.uid)
            .onSnapshot((snapshot) => {
                let chats = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                dispatch({ type: USER_CHATS_STATE_CHANGE, chats })
            })
    })
}
export function fetchUserPosts() {
    return ((dispatch) => {
        firebase.firestore()
            .collection("posts")
            .doc(firebase.auth().currentUser.uid)
            .collection("userPosts")
            .orderBy("creation", "desc")
            .get()
            .then((snapshot) => {
                let posts = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                dispatch({ type: USER_POSTS_STATE_CHANGE, posts })
            })
    })
}

export function fetchUserFollowing() {
    return ((dispatch) => {
        firebase.firestore()
            .collection("following")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowing")
            .onSnapshot((snapshot) => {
                let following = snapshot.docs.map(doc => {
                    const id = doc.id;
                    return id
                })
                dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
                for (let i = 0; i < following.length; i++) {
                    dispatch(fetchUsersData(following[i], true));
                }
            })
    })
}

export function fetchUserFollowers() {
    return ((dispatch) => {
        firebase.firestore()
            .collection("followers")
            .doc(firebase.auth().currentUser.uid)
            .collection("userFollowedBy")
            .onSnapshot((snapshot) => {
                let followers = snapshot.docs.map(doc => {
                    const id = doc.id;
                    return id
                })
                dispatch({ type: USER_FOLLOWERS_STATE_CHANGE, followers });
                for (let i = 0; i < followers.length; i++) {
                    dispatch(fetchUsersData(followers[i], false));
                }
            })
    })
}

export function fetchUsersData(uid, getPosts) {
    return ((dispatch, getState) => {
        const found = getState().usersState.users.some(el => el.uid === uid);
        if (!found) {
            firebase.firestore()
                .collection("users")
                .doc(uid)
                .get()
                .then((snapshot) => {
                    if (snapshot.exists) {
                        let user = snapshot.data();
                        user.uid = snapshot.id;

                        dispatch({ type: USERS_DATA_STATE_CHANGE, user });
                    }
                })
            if (getPosts) {
                dispatch(fetchUsersFollowingPosts(uid));
            }
        }
    })
}

export function fetchUsersFollowingPosts(uid) {
    return ((dispatch, getState) => {
        firebase.firestore()
            .collection("posts")
            .doc(uid)
            .collection("userPosts")
            .orderBy("creation", "asc")
            .get()
            .then((snapshot) => {
                const uid = snapshot.query.EP.path.segments[1];
                const user = getState().usersState.users.find(el => el.uid === uid);


                let posts = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data, user }
                })

                for (let i = 0; i < posts.length; i++) {
                    dispatch(fetchUsersFollowingLikes(uid, posts[i].id))
                }
                dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid })

            })
    })
}

export function fetchUsersFollowingLikes(uid, postId) {
    return ((dispatch, getState) => {
        firebase.firestore()
            .collection("posts")
            .doc(uid)
            .collection("userPosts")
            .doc(postId)
            .collection("likes")
            .doc(firebase.auth().currentUser.uid)
            .onSnapshot((snapshot) => {
                const postId = snapshot.ZE.path.segments[3];

                let currentUserLike = false;
                if (snapshot.exists) {
                    currentUserLike = true;
                }

                dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike })
            })
    })
}