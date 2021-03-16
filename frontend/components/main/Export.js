import React, { useState } from 'react';
import { Button, Share, View, TouchableOpacity, Image, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { modal, utils, text, container } from '../styles';
import Modal from 'react-native-modal';

const Export = (props) => {
    const [isModalVisible, setModalVisible] = useState(false);

    const { imageUri } = props;

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const onExport = () => {
        return (
            <Button title='button' onPress={() => {}}/>
            // <Modal 
            //         isVisible={isModalVisible}
            //         backdropColor={"black"}
            //         backdropOpacity={0.1}>
            //         <View style={{
            //                 flex: 1,
            //                 flexDirection: 'column',
            //                 justifyContent: 'center',
            //                 alignItems: 'center'}}>
            //             <View style={[modal.modalContainer]}> 
            //                 <View style={utils.justifyCenter}>
            //                     <Text style={[text.bold, text.medium]} >Share Post</Text>
            //                 </View>

            //                 <View style={[container.horizontal]}> 
            //                     <TouchableOpacity onPress={() => {}}>
            //                         <Image
            //                             style={[ utils.profileImageBig ]}
            //                             source={require('../../assets/imessage_share_icon_2.png')} 
            //                         />
            //                     </TouchableOpacity>
            //                     <TouchableOpacity onPress={() => {}}>
            //                         <Image
            //                             style={[ utils.profileImageBig ]}
            //                             source={require('../../assets/twitter_share_icon.png')}
            //                         />
            //                     </TouchableOpacity>
            //                 </View>
                            
            //             </View>
                        
            //         </View>
            //     </Modal>
        )
    };


  return (
    <>
      <Feather style={{ marginHorizontal: 5}} name="download" size={28} color="white" onPress={() => onExport()} />
    </>
  );
};

export default Export;