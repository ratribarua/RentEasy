import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  Avatar,
  Title,
  Caption,
  Text as PaperText,
  TouchableRipple,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore, signOut } from './firebaseConfig';

const ProfileScreen = (props) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('No matching documents.');
          setLoading(false);
          return;
        }

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          setUserData(userData);
          setLoading(false);
        });
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        Alert.alert('User signed out!');
        navigation.replace('Login');
      })
      .catch((error) => {
        console.log('Error during logout:', error.message);
        Alert.alert('Failed to log out. Please try again.');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : userData ? (
        <>
          <View style={styles.userInfoSection}>
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <Avatar.Image
                source={{
                  uri: userData?.dp_url || 'default_profile_image_url',
                }}
                size={80}
              />
              <View style={{ marginLeft: 20 }}>
                <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>
                  {userData?.userName}
                </Title>
                <Caption style={styles.caption}>@{userData?.userName}</Caption>
              </View>
            </View>
          </View>

          <View style={styles.userInfoSection}>
            <View style={styles.row}>
              <Icon name="account" color="#777777" size={20} />
              <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>
                {userData?.userName}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon name="book" color="#777777" size={20} />
              <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>
                {userData?.semester}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon name="email" color="#777777" size={20} />
              <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>
                {userData?.email}
              </Text>
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
                <PaperText style={styles.menuItemText}>My Books(to give rent)</PaperText>
              </View>
            </TouchableRipple>

            <TouchableRipple onPress={() => {}}>
              <View style={styles.menuItem}>
                <Icon name="book-arrow-left-outline" color="#FF6347" size={25} />
                <PaperText style={styles.menuItemText}>Borrowed</PaperText>
              </View>
            </TouchableRipple>

            <TouchableRipple onPress={() => props.navigation.navigate('Edit')}>
              <View style={styles.menuItem}>
                <Icon name="cog-outline" color="#FF6347" size={25} />
                <PaperText style={styles.menuItemText}>Edit Profile</PaperText>
              </View>
            </TouchableRipple>
          </View>

          <View style={styles.menuWrapper}>
            <TouchableRipple onPress={handleLogout}>
              <View style={styles.menuItem}>
                <Icon name="logout" color="#FF6347" size={25} />
                <PaperText style={styles.menuItemText}>Logout</PaperText>
              </View>
            </TouchableRipple>
          </View>
        </>
      ) : (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorMessage}>User data not found. Please log in again.</Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
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
  loginLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;

















// import { StyleSheet,SafeAreaView, View, TouchableOpacity } from 'react-native'

// import {
//   Avatar,
//   Title,
//   Caption,
//   Text,
//   TouchableRipple,
// } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// import React, { useState, useEffect } from 'react';
// import {useNavigation} from '@react-navigation/native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { auth, db, signOut,firestore} from './firebaseConfig';
// //import { signOut } from 'firebase/auth'; 



// const ProfileScreen = (props) => {
//   const [userData, setUserData] = useState(null);
//   const navigation = useNavigation();

//   const getUserData = async() =>{
//     try {
//       const usersRef = collection(firestore, "users");
//       const q = query(usersRef, where("email", "==", auth.currentUser.email));
//       const querySnapshot = await getDocs(q);
//       querySnapshot.forEach((doc) => {
//         const userData = doc.data();
//         const { userName, user_id, email, dp_url, semester } = userData;
//         const loggedUserData = {
//           userRef: user_id,
//           email: email,
//           userName: userName,
//           userProfilePic: dp_url,
//           semester : semester
//         }
//         setUserData(loggedUserData);
//       })
//     }
//     catch (e) {
//       console.log(e);
//     }
//   }
  

//   useEffect(() => {
//     getUserData();
//   }, []);

//   const handleLogout = () => {
//     auth()
//       .signOut()
//       .then(response => {
//         console.log('response :', response);
//         Alert.alert('User signed out!');
//       })
//       .catch(error => {
//         console.log('error :', error);
//         Alert.alert('Not able to logout!');
//       });
//   }
  


//   return (
//     <SafeAreaView style={styles.container}>
//     <View style={styles.userInfoSection}>
//       <View style={{ flexDirection: 'row', marginTop: 15 }}>
//         <Avatar.Image source={{ uri: userData?.dp_url || 'default_profile_image_url' }} size={80} />
//         <View style={{ marginLeft: 20 }}>
//           <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>{userData?.userName}</Title>
//           <Caption style={styles.caption}>@{userData?.userName}</Caption>
//         </View>
//       </View>
//     </View>

//     <View style={styles.userInfoSection}>
//       <View style={styles.row}>
//         <Icon name="account" color="#777777" size={20} />
//         <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.userName}</Text>
//       </View>
//       <View style={styles.row}>
//         <Icon name="book" color="#777777" size={20} />
//         <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.semester}</Text>
//       </View>
//       <View style={styles.row}>
//         <Icon name="email" color="#777777" size={20} />
//         <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.email}</Text>
//       </View>
//     </View>

//       <View style={[styles.infoBox]}>
//         <Title>Additional Information</Title>
//         {/* Display additional information */}
//       </View>

//       <View style={styles.menuWrapper}>
//         <TouchableRipple onPress={() => props.navigation.navigate('HomePage')}>
//           <View style={styles.menuItem}>
//             <Icon name="book-arrow-right" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>My Books(to give rent)</Text>
//           </View>
//         </TouchableRipple>

//         <TouchableRipple onPress={() => {}}>
//           <View style={styles.menuItem}>
//             <Icon name="book-arrow-left-outline" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>Borrowed</Text>
//           </View>
//         </TouchableRipple>

//         <TouchableRipple onPress={() => props.navigation.navigate('Edit')}>
//           <View style={styles.menuItem}>
//             <Icon name="cog-outline" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>Edit Profile</Text>
//           </View>
//         </TouchableRipple>
//       </View>

//       <View style={styles.menuWrapper}>
//         <TouchableRipple onPress={handleLogout}>
//           <View style={styles.menuItem}>
//             <Icon name="logout" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>Logout</Text>
//           </View>
//         </TouchableRipple>
//       </View>

//     </SafeAreaView>
//   );
// };

// export default ProfileScreen

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   userInfoSection: {
//     paddingHorizontal: 30,
//     marginBottom: 25,
//   },
//   title: {
//     fontSize: 29,
//     fontWeight: 'bold',
//   },
//   caption: {
//     fontSize: 15,
//     lineHeight: 14,
//     fontWeight: '500',
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   infoBoxWrapper: {
//     borderBottomColor: '#dddddd',
//     borderBottomWidth: 1,
//     borderTopColor: '#dddddd',
//     borderTopWidth: 1,
//     flexDirection: 'row',
//     height: 50,
//     alignContent: 'center',
//   },
//   infoBox: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontWeight: 'bold',
//     fontSize: 50,
//     color: '#dddddd',
//   },
//   menuWrapper: {
//     marginTop: 10,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//   },
//   menuItemText: {
//     color: '#777777',
//     marginLeft: 20,
//     fontWeight: '600',
//     fontSize: 16,
//     lineHeight: 26,
//   },
// });




//  // <SafeAreaView style={styles.container}>
//     //   <View style={styles.userInfoSection}>
//     //     <View style={{ flexDirection: 'row', marginTop: 15 }}>
//     //       <Avatar.Image source={{ uri: userData?.dp_url || 'default_profile_image_url' }} size={80} />
//     //       <View style={{ marginLeft: 20 }}>
//     //         <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>{userData?.userName}</Title>
//     //         <Caption style={styles.caption}>@{userData?.userName}</Caption>
//     //       </View>
//     //     </View>
//     //   </View>

//     //   <View style={styles.userInfoSection}>
//     //     {/* Display other user information */}
//     //   </View>