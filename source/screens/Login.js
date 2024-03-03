import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Added state to manage password visibility
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);
    const navigate = useNavigation();

    const loginhere = async () => {
        try {
            setLoading(true);
            setEmail(email.trim());

            await signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                alert("Logged in")
                if (user.emailVerified) {
                    const usersRef = collection(firestore, "users");
                    const q = query(usersRef, where("email", "==", email));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        const userData = doc.data();
                        const { userName, user_id, email, dp_url } = userData;
                        const loggedUserInfo = {
                            userRef: user_id,
                            userEmail: email,
                            userName: userName,
                            userProfilePic: dp_url
                        };
                        if (isRememberMeChecked) {
                            const loggedUserInfoString = JSON.stringify(loggedUserInfo);
                            AsyncStorage.setItem('userData', loggedUserInfoString)
                                .then(() => {
                                    console.log('Data stored successfully!');
                                })
                                .catch((error) => {
                                    console.log('Error storing data:', error);
                                });
                        }
                        setEmail('');
                        setPassword('');
                        setLoading(false);
                        navigation.navigate("ProfileScreen", {
                            userData: loggedUserInfo,
                          }); // Navigate to the profile screen

                    });
                } else {
                    Alert.alert("Please verify your email first.");
                    setLoading(false);
                }
            })
            .catch((e) => {
                if (e.code === 'auth/invalid-email') setErrorMessage("Invalid Email.");
                else if (e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-login-credentials') setErrorMessage("Invalid Credentials");
                else if (e.code === 'auth/too-many-requests') setErrorMessage("Please try again later.");
                else if (e.code === 'auth/user-not-found') setErrorMessage('No account matches this email');
                else console.log(e);
                setLoading(false);
            });
        } catch (error) {
            if (error.code === 'auth/invalid-credential') setErrorMessage("Wrong Password");
            else if (error.code === 'auth/user-not-found') setErrorMessage('No account matches this email');
            else console.log(error);
            setLoading(false);
        }
    };

    const onLoginPress = () =>{
        loginhere(); //login user
    }

    useEffect(() => {
        const checkLoggedIn = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              try{
                const parsedUserData = JSON.parse(userData);
              update_user_info(parsedUserData)
              navigation.navigate('ProfileScreen')
              }
            catch(error){
                console.warn('Error parsing stored user data:', error); 
            }
            }
          };
          checkLoggedIn()
    }, [])

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                style={styles.input}
                placeholder='E-mail'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
                value={email}
                autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholderTextColor="#aaaaaa"
                    secureTextEntry={!showPassword}
                    placeholder='Password'
                    onChangeText={(text) => { setPassword(text); setErrorMessage('') }}
                    value={password}
                    autoCapitalize="none"
                />
               <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#aaaaaa" />
                        </TouchableOpacity>
            </View>
            <View style={styles.checkboxContainer}>
                <Checkbox
                    style={styles.checkbox}
                    status={isRememberMeChecked ? 'checked' : 'unchecked'}
                    onPress={() => {setIsRememberMeChecked(!isRememberMeChecked);}}
                    color={isRememberMeChecked ? '#e80909' : undefined}
                />
                <Text onPress={() => {setIsRememberMeChecked(!isRememberMeChecked);}} style={styles.checkboxLabel}>Remember me</Text>
            </View>
            {errorMessage.length > 0 && <Text style={styles.errorMessage}>*{errorMessage}*</Text>}
            <TouchableOpacity
                disabled={password.length === 0 || email.length === 0}
                style={styles.button}
                onPress={onLoginPress}>
                <Text style={styles.buttonTitle}>
                    Log in
                </Text>
            </TouchableOpacity>
            <View style={styles.footerView}>
                <Text style={styles.footerText}>Don't have an account? 
                <Text onPress={() => {
                    setEmail('');
                    setPassword('');
                    setErrorMessage('')
                    navigation.navigate('Signup')
                }} style={styles.footerLink}>
                Sign up
                </Text>
                </Text>
            </View>
            <View style={styles.footerView}>
                <Text style={styles.footerText}>
                <Text onPress={() => {
                    navigation.navigate('ProfileScreen')
                }} style={styles.footerLink}>
                Profile
                </Text>
                </Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
    },
    input: {
        height: 40,
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor:'#e6e6fa',
        height: 60,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        paddingHorizontal: 10,
        backgroundColor:'#e6e6fa',
        height: 60,
    },
    passwordInput: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
    },
    eyeIcon: {
        padding: 10,
    },
    errorMessage: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#32cd32',
        padding: 15,
        borderRadius: 150,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
      },
    buttonTitle: {
        color: 'white',
        textAlign: 'center',
    },
    footerView: {
        flexDirection: 'row',
        marginTop: 20,
    },
    footerText: {
        fontSize: 16,
    },
    footerLink: {
        fontSize: 16,
        color: '#8b008b',
        marginLeft: 5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        marginHorizontal:15,
        width:'50%'
      },
      checkbox: {
        alignSelf: 'center',
        
      },
      checkboxLabel: {
        margin: 8,
      },
});






















// import { StyleSheet, Text, View } from 'react-native'
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Btn from './Btn'
// import {Touchable, TouchableOpacity} from 'react-native';
// import { TextInput } from 'react-native-paper';

// import React, { useState } from 'react'
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
// import {auth,db} from './firebaseConfig';



// const Login = (props) => {
//   //const auth = getAuth();
//   const [email,setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errorMessage, seterrorMessage] = useState('');
  
//   const loginhere =() =>{
//       signInWithEmailAndPassword(auth, email, password)
//       .then(() => {
//         // Navigate to the home screen or any other screen
//         alert('Logged in successfully!');
//         //navigate.replace('Profile');
//       })
//       .catch(error => {
//         if (error.code === 'auth/invalid-email') {
//           alert('Invalid email address format.');
//         }

//         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
//           alert('Invalid email address or password.');
//         }

//         console.error(error);
//       });
//   };

//   const loginUser = async ()=>{

//     try {
//       const { user } =await signInWithEmailAndPassword(auth, email, password)}
//     catch (e) {
//         if(e.code==='auth/wrong-password') seterrorMessage("Wrong Password")
//         if(e.code==='auth/user-not-found') seterrorMessage('No account matches this email')
//         seterrorMessage(e.code)
//         alert.log(e)
        
//         // setloading(false)
//     }

//   }
//   return (
//     <View>
//       <Text style ={
//         [styles.mainHeader,{fontSize: 30, color:"#4b0082",marginTop:100, marginLeft:80, marginBottom: 20},]}>
//           Login To Your Account
//       </Text>
//       <View style ={{
//         marginHorizontal: 20,
        
//       }}>
//       <TextInput
//       label = "Email"
//       style={{
//         marginBottom:10,
       
//         //borderColor: 'gray',
//         }}
//         onChangeText ={(text) => setEmail(text)}
//         />
//       <TextInput
//       label = "Password"
//       secureTextEntry={true}
//       style={{
//         marginBottom:10,
//         }}
//         onChangeText ={(text) => setPassword(text)}
//         />
//       </View>
      
//       <View
//             style={{alignItems: 'flex-end', width: '90%', paddingLeft: 90, marginBottom: 100}}>
//             <Text style={{color: '#4b0082', fontWeight: '500', fontSize: 20, paddingVertical: 15,marginBottom: 10}}>
//               Forgot Password ?
//             </Text>
//       </View>
//       <View style={{ marginHorizontal: 20,marginVertical: 10, paddingVertical: 10}}>
      
      
//       <Btn bgColor ={'#32cd32'} textColor={'#4b0082'} btnLabel ={"Login"} Press={() => loginhere()} />
//       </View>
//       <View style={{alignItems: 'flex-end', width: '90%'}}>
//             <Text style={{color: '#4b0082', fontWeight: '500', fontSize: 20}}>Don't have an account ?</Text>
//             <TouchableOpacity onPress={() => props.navigation.navigate("Signup")}>
//             <Text style={{ color: '#3cb371', fontWeight: 'bold', fontSize: 20 }}>Signup</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => props.navigation.navigate("Profile")}>
//             <Text style={{ color: '#3cb371', fontWeight: 'bold', fontSize: 20 }}>Profile</Text>
//             </TouchableOpacity>
//           </View>
//       </View>
//   );
// }<View style={{alignItems: 'flex-end', width: '90%'}}><TouchableOpacity onPress={() => props.navigation.navigate("Profile")}>
//             <Text style={{ color: '#3cb371', fontWeight: 'bold', fontSize: 20 }}>Profile</Text>
//             </TouchableOpacity></View>

// export default Login;

// const styles = StyleSheet.create({});