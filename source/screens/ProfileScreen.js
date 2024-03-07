import { StyleSheet,SafeAreaView, View, TouchableOpacity } from 'react-native'

import {
  Avatar,
  Title,
  Caption,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import React, { useState, useEffect } from 'react';
import {useNavigation} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, signOut,firestore} from './firebaseConfig';
//import { signOut } from 'firebase/auth'; 



const ProfileScreen = (props) => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);

  const getUserData = async() =>{
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const { userName, user_id, email,dp_url, semester } = userData;
        const loggedUserData = {
          userRef: user_id,
          email: email,
          userName: userName,
          userProfilePic: dp_url,
          semester : semester
        }
        setUserData(loggedUserData);
      })
    }
    catch (e) {
      console.log(e);
    }
  }
  

  useEffect(() => {
    getUserData();
  }, []);
  

  const handleLogout = () => {
    auth.signOut().then(() => {
      console.log('doing');
      navigation.replace('Login');
    }).catch(error => {
      console.error('Error signing out:', error);
    });
  };
  


  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.userInfoSection}>
      <View style={{ flexDirection: 'row', marginTop: 15 }}>
        <Avatar.Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/renteasyproject.appspot.com/o/Avatar.png?alt=media&token=6d108f5e-844f-47fe-bbf2-ac2c30ab931d'}} size={80} />
        <View style={{ marginLeft: 20 }}>
          <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>{userData?.userName}</Title>
          <Caption style={styles.caption}>@{userData?.userName}</Caption>
        </View>
      </View>
    </View>

    <View style={styles.userInfoSection}>
      <View style={styles.row}>
        <Icon name="account" color="#777777" size={20} />
        <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.userName}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="book" color="#777777" size={20} />
        <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.semester}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="email" color="#777777" size={20} />
        <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.email}</Text>
      </View>
    </View>

      <View style={[styles.infoBox]}>
        <Title>Additional Information</Title>
        {/* Display additional information */}
      </View>

      <View style={styles.menuWrapper}>
        <TouchableRipple onPress={() => props.navigation.navigate('HomePage')}>
          <View style={styles.menuItem}>
            <Icon name="book-arrow-right" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>My Books(to give rent)</Text>
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={() => {}}>
          <View style={styles.menuItem}>
            <Icon name="book-arrow-left-outline" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Borrowed</Text>
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={() => props.navigation.navigate('EditProfileScreen')}>
          <View style={styles.menuItem}>
            <Icon name="cog-outline" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
        </TouchableRipple>
      </View>

      <View style={styles.menuWrapper}>
        <TouchableRipple onPress={handleLogout}>
          <View style={styles.menuItem}>
            <Icon name="logout" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Logout</Text>
          </View>
        </TouchableRipple>
      </View>

    </SafeAreaView>
  );
};

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 29,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 15,
    lineHeight: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoBoxWrapper: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 50,
    alignContent: 'center',
  },
  infoBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 50,
    color: '#dddddd',
  },
  menuWrapper: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  menuItemText: {
    color: '#777777',
    marginLeft: 20,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 26,
  },
});
