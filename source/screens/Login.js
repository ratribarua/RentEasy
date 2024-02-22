import { StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Btn from './Btn'
import {Touchable, TouchableOpacity} from 'react-native';
import { TextInput } from 'react-native-paper';

import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import {auth,db} from './firebaseConfig';



const Login = (props) => {
  //const auth = getAuth();
  const [email,setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, seterrorMessage] = useState('');
  
  const loginhere =() =>{
    //auth()
      signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Navigate to the home screen or any other screen
        alert('Logged in successfully!');
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          alert('Invalid email address format.');
        }

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          alert('Invalid email address or password.');
        }

        console.error(error);
      });
  };

  const loginUser = async ()=>{

    try {
      const { user } =await signInWithEmailAndPassword(auth, email, password)}
    catch (e) {
        if(e.code==='auth/wrong-password') seterrorMessage("Wrong Password")
        if(e.code==='auth/user-not-found') seterrorMessage('No account matches this email')
        seterrorMessage(e.code)
        alert.log(e)
        
        // setloading(false)
    }

  }
  return (
    <View>
      <Text style ={
        [styles.mainHeader,{fontSize: 30, color:"#4b0082",marginTop:100, marginLeft:80, marginBottom: 20},]}>
          Login To Your Account
      </Text>
      <View style ={{
        marginHorizontal: 10,
      }}>
      <TextInput
      label = "Email"
      style={{
        marginBottom:10,
        }}
        onChangeText ={(text) => setEmail(text)}
        />
      <TextInput
      label = "Password"
      secureTextEntry={true}
      style={{
        marginBottom:10,
        }}
        onChangeText ={(text) => setPassword(text)}
        />
      </View>
      
      <View
            style={{alignItems: 'flex-end', width: '90%', paddingLeft: 90, marginBottom: 100}}>
            <Text style={{color: '#4b0082', fontWeight: '500', fontSize: 20, paddingVertical: 15,marginBottom: 10}}>
              Forgot Password ?
            </Text>
      </View>
      <View style={{ marginHorizontal: 20,marginVertical: 10, paddingVertical: 10}}>
      
      
      <Btn bgColor ={'#32cd32'} textColor={'#4b0082'} btnLabel ={"Login"} Press={() => loginhere()} />
      </View>
      <View style={{alignItems: 'flex-end', width: '90%'}}>
            <Text style={{color: '#4b0082', fontWeight: '500', fontSize: 20}}>Don't have an account ?</Text>
            <TouchableOpacity onPress={() => props.navigation.navigate("Signup")}>
            <Text style={{ color: '#3cb371', fontWeight: 'bold', fontSize: 20 }}>Signup</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.navigation.navigate("Profile")}>
            <Text style={{ color: '#3cb371', fontWeight: 'bold', fontSize: 20 }}>Profile</Text>
            </TouchableOpacity>
          </View>
      </View>
  );
}

export default Login;

const styles = StyleSheet.create({});