import { StyleSheet} from 'react-native'
import React from 'react'
import {View, Text, Touchable, TouchableOpacity} from 'react-native';
import Background from './Background'
import Btn from './Btn'

const HomePage = (props) => {
  return (
    <Background>
       <Text style ={
        [styles.mainHeader,{fontSize: 30, color:"#4b0082",marginTop:430, marginLeft:75},]}>
          Login To Your Account
      </Text>
      <View style={{ marginHorizontal: 25,marginVertical:50}}>
      <Btn bgColor ={'#2BB789'} textColor={'#4b0082'} btnLabel ={"Login"} Press={() => props.navigation.navigate("Login")} />
      </View>
      <View style={{ marginHorizontal: 25,marginVertical:-30}}>
      <Btn bgColor ={'#87cefa'} textColor={'#4b0082'} btnLabel ={"Signup"} Press={() => props.navigation.navigate("Signup")} />
      </View>
    </Background>
  );
}

export default HomePage

const styles = StyleSheet.create({})