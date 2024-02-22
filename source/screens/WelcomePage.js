import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import Btn from './Btn'

const WelcomePage = (props) => {
  //const description = "";
  return (
    <View style={styles.container}>
     <View style = {styles.homeTop}>
      <Image 
      style={styles.headerImage}
      resizeMode='contain'
      source={require("../../assets/welcomepagepic.png")}
      />
      <Text style ={
        [styles.mainHeader,{fontSize: 40, color:"#4b0082",marginTop:0,
      },]}>
          Rent Easy
      </Text>
      <Text style ={
        [styles.mainHeader,{fontSize: 30, color:"#9370db",marginTop:0,
      },]}>
          Rent ~ Read ~ Return
      </Text>
     </View>
     </View>
    );
  }
  /*<View style={{ marginHorizontal: 30,marginVertical:100}}>
      <Btn bgColor ={'#2BB789'} textColor={'#4b0082'} btnLabel ={"Let's Start"} Press={() => props.navigation.navigate("HomePage")} />
      </View>*/
  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      height: '100%',
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      textAlign: 'center',
    },
  
    homeTop:{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 10,
  
    },
  
    headerImage:{
      height: undefined,
      width: '100%',
      aspectRatio: 1,
      display: 'flex',
      alignItems: 'stretch',
      marginTop: 50,
      borderRadius: 20,
    },
  
  });
   export default WelcomePage;