import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';

export default function BtnRegister({bgColor, btnLabel, textColor, Press}) {
  return (
    <TouchableOpacity
    onPress={Press}
      style={{
        backgroundColor: bgColor,
        borderRadius: 150,
        alignItems: 'center',
        //width: 300,
        paddingVertical: 10,
        marginRight:50
      }}>
      <Text style={{color: textColor, fontSize: 25, fontWeight: 'bold'}}>
        {btnLabel}
      </Text>
    </TouchableOpacity>
  );
}