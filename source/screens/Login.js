import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';



export default function Login({navigation }) {
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
                navigation.navigate("ProfileScreen");
                
                if (user.emailVerified) {
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("email", "==", email));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        const userData = doc.data();
                        const { userName, user_id, email, dp_url,semester } = userData;
                        const loggedUserInfo = {
                            userRef: user_id,
                            userEmail: email,
                            userName: userName,
                            userProfilePic: dp_url,
                            semester : semester
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
                        // Navigate to the profile screen

                        navigation.navigate("ProfileScreen");
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
                    color={isRememberMeChecked ? 'green' : undefined}
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
        backgroundColor: '#4b0082',
        padding: 13,
        borderRadius: 150,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
      },
    buttonTitle: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
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
