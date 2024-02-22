import React from 'react';
import {TextInput} from 'react-native';

const FieldRegister = props => {
  return (
    <TextInput
      {...props}
      style={{
      fontSize: 20,
      fontWeight: 'bold',
      borderRadius: 80, 
      color: '#2f4f4f', 
      paddingHorizontal: 40,
      paddingVertical: 15,
      backgroundColor: '#add8e6', 
      marginBottom:20,
      //width: '100%',
      marginLeft: 5,
      marginRight:50,
      }}
      placeholderTextColor={'#778899'}>

      </TextInput>
  );
};

export default FieldRegister;