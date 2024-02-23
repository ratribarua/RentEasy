import { StyleSheet, Text, View, Image } from 'react-native'

import React, { useRef, useState, useEffect } from 'react';

import { gsap } from 'gsap-rn';

const WelcomePage = (props) => {
  const viewRef = useRef(null);

  useEffect(() => {
    const view = viewRef.current;
    gsap.to(view, { duration: 5, transform: { rotate: 360, scale: 2.5 } });
  }, [])

  return (
    <View style={styles.container}>
     <View style = {styles.homeTop}>
      <View>
        <Image
            ref={viewRef}
            style={styles.logo}
            source={require('../../assets/icon3.jpg')}
          />
      </View>
      <Text style ={
        [styles.mainHeader,{fontSize: 40, color:"#4b0082",marginTop: 50,
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
      marginTop: 200,
  
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

    logo: {
      alignSelf: 'center',
      height: 100,
      width: 100,
      marginBottom: 10,
      marginTop: 15
    },
  
  });
   export default WelcomePage;