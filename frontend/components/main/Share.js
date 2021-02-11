import React from 'react';
import { Share } from 'react-native';
import { Feather } from '@expo/vector-icons';


const ShareExample = (props) => {
  const { imageUri } = props;
  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'React Native | A framework for building native apps using React',
        url: imageUri,
        title: 'Title'
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <>
      <Feather style={{ marginLeft: 'auto',}} name="share" size={28} color="white" onPress={onShare} />
    </>
  );
};

export default ShareExample;