
import { Dimensions, StyleSheet } from 'react-native'
const utils = StyleSheet.create({
    centerHorizontal: {
        alignItems: 'center',
    },
    marginBottom: {
        marginBottom: 20,
    },
    marginBottomBar: {
        marginBottom: 330,
    },
    marginBottomSmall: {
        marginBottom: 10,
    },
    profileImageBig: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
    },
    profileImage: {
        marginRight: 15,
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
    },
    profileImageSmall: {
        marginRight: 15,
        width: 35,
        height: 35,
        borderRadius: 35 / 2,
    },
    searchBar: {
        backgroundColor: 'whitesmoke',
        color: 'grey',
        paddingLeft: 10,
        borderRadius: 8,
        height: 40,
        marginTop: -5
    },
    justifyCenter: {
        justifyContent: 'center',
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    padding15: {
        paddingTop: 15,
        paddingRight: 15,
        paddingLeft: 15,
    },
    padding10Top: {
        paddingTop: 10

    },
    padding10: {
        padding: 10
    },
    padding10Sides: {
        paddingRight: 10,
        paddingLeft: 10,
    },
    padding30Sides: {
        paddingRight: 30,
        paddingLeft: 30,
    },
    margin15: {
        margin: 15
    },
    margin15Left: {
        marginLeft: 15,
    },
    margin15Right: {
        marginRight: 15,
    },
    margin: {
        margin: 5,
    },
    padding20Vertical: {
        paddingVertical: 20,
    },
    background: {
        // width: '100%',
        // height: 'auto',
        position: 'absolute',
        opacity: 0.075,
        left: 0,
        right: 0,
        top: 0,
        height: '100%'
    },
    backgroundBlack: {
        backgroundColor: 'black',
    },
    backgroundWhite: {
        backgroundColor: 'white',
    },
    borderTopGray: {
        marginTop:10,
        borderTopWidth: 0.5,
        borderColor: 'lightgrey',
        // width: '90%',
        alignSelf: 'center'
    },
    borderBottomGray: {
        marginBottom:10,
        borderBottomWidth: 0.5,
        borderColor: 'lightgrey',
        // width: '90%',
        alignSelf: 'center'
    },
    borderWhite: {
        borderWidth: 1,
        borderColor: 'white'
    },
    buttonOutlined: {
        padding: 8,
        color: 'white',
        borderWidth: 1,
        borderColor: 'lightgrey',
        borderRadius: 8,
        textAlign: 'center',
    },

    fixedRatio: {
        flex: 1,
        aspectRatio: 1
    }
})
const navbar = StyleSheet.create({

    image: {
        padding: 20
    },
    custom: {
        marginTop: 50,
        height: 60,
        // backgroundColor: 'black',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: 'white'
    },

    title: {
        fontWeight: '700',
        fontSize: 20, //'larger',
        color: 'white'
    }
})
const container = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
        flexDirection: 'row'
    },
    input: {
        flexWrap: "wrap"
    },
    containerPadding: {
        flex: 1,
        padding: 15
    },
    center: {
        flex: 1,
    },
    horizontal: {
        flexDirection: 'row',
        display: 'flex',
    },
    form: {
        flex: 1,
        margin: 25
    },
    profileInfo: {
        padding: 25,
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 'auto',
    },
    column: {
        flexDirection: 'column',
        alignItems: 'center',
        height: 'auto',

    },
    formCenter: {
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 25
    },
    containerImage: {
        flex: 1 / 3,
    },
    containerGridImage: {
        flex: 1 / 3,
        borderWidth: 1,
        borderColor: 'white',
        // paddingVertical: 5,
    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1,
    },
    imageForGrid: {
        flex: 1,
        aspectRatio: 1 / 1,
        alignSelf: 'center',
        height: (Dimensions.get('window').width - 30) / 3,
    },
    imageForImport: {
        flex: 1,
        aspectRatio: 1 / 1,
        alignSelf: 'center',
        height: '50%',
    },
    fillHorizontal: {
        flexGrow: 1,
        paddingBottom: 0
    },
    imageSmall: {
        aspectRatio: 1 / 1,
        height: 70
    },
    gallery: {
        borderWidth: 1,
        borderColor: 'gray',
    },
    splash: {
        padding: 200,
        height: '100%',
        width: '100%'
    },
    chatRight: {
        margin: 10,
        marginBottom: 10,
        backgroundColor: 'dodgerblue',
        padding: 10,
        borderRadius: 8,
        alignSelf: 'flex-end'

    },
    chatLeft: {
        margin: 10,
        marginBottom: 10,
        backgroundColor: 'grey',
        padding: 10,
        borderRadius: 8,
        alignItems: 'flex-end',
        textAlign: 'right',
        alignSelf: 'flex-start'
    }
})

const form = StyleSheet.create({
    textInput: {
        marginBottom: 10,
        borderColor: 'gray',
        backgroundColor: 'whitesmoke',
        padding: 10,
        borderWidth: 1,
        borderRadius: 8
    },
    bottomButton: {
        alignContent: 'center',
        borderTopColor: 'gray',
        borderTopWidth: 1,
        padding: 10,
        textAlign: 'center',
    },
    roundImage: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2
    }

})

const text = StyleSheet.create({
    center: {
        textAlign: 'center',
    },
    notAvailable: {
        textAlign: 'center',
        fontWeight: '700',//'bolder',
        fontSize: 20//'large',
    },
    top5:{
        textAlign: "center", 
        backgroundColor: "#000000a0",
        fontWeight: '700',
    },
    profileDescription: {
        fontWeight: '300'
    },
    changePhoto: {
        marginTop: 5,
        color: 'deepskyblue',
    },
    deepskyblue: {
        color: 'deepskyblue',
    },
    username: {
        fontWeight: '600',
        color: 'white',
    },
    name: {
        color: 'grey',
    },
    bold: {
        fontWeight: '700',
    },
    large: {
        fontSize: 20//'large'
    },
    small: {
        fontSize: 10//'large'
    },
    medium: {
        fontSize: 15, //'large'
        marginBottom: 10
    },
    grey: {
        color: 'grey'
    },
    green: {
        color: 'lightgreen'
    },
    white: {
        color: 'white'
    },
    whitesmoke: {
        color: 'whitesmoke'
    }
})

const modal = StyleSheet.create({
    modalContainer: {  
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderStyle: 'solid',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1
    }

})

export { container, form, text, utils, navbar, modal }    