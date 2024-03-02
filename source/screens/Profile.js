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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';




const Profile = (props) => {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Fetch user data from Firebase using the stored UID or any identifier
    const fetchUserData = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('user_id', '==', 'user_id')); // Replace 'stored_uid_here' with the actual stored UID
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUserData(doc.data());
      });
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userInfoSection}>
        <View style={{ flexDirection: 'row', marginTop: 15 }}>
          <Avatar.Image source={{ uri: userData?.dp_url || 'default_profile_image_url' }} size={80} />
          <View style={{ marginLeft: 20 }}>
            <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>{userData?.userName}</Title>
            <Caption style={styles.caption}>@{userData?.userName}</Caption>
          </View>
        </View>
      </View>

      <View style={styles.userInfoSection}>
        {/* Display other user information */}
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

        <TouchableRipple onPress={() => props.navigation.navigate('Edit')}>
          <View style={styles.menuItem}>
            <Icon name="cog-outline" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
        </TouchableRipple>
      </View>
    </SafeAreaView>
  );
};

export default Profile

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