import React from 'react';
import {View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
const DefaultImage = ({style, iconSize, color = '#555'}) => {
  return (
    <View style={style}>
      <AntDesign name="meh" size={iconSize} color={color} />
    </View>
  );
};

export default DefaultImage;
