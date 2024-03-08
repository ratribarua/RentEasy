// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
// import { collection, where, query, getDocs, updateDoc, doc } from 'firebase/firestore';
// import { auth, db, storage } from './firebaseConfig'; // Make sure to import storage
// import * as ImagePicker from 'expo-image-picker';

// const EditProfile = () => {
//   const [userData, setUserData] = useState(null);
//   const [newName, setNewName] = useState('');
//   const [imageUri, setImageUri] = useState(null);
//   const [newImageUri, setnewImageUri] = useState(null)

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const usersRef = collection(db, 'users');
//         const q = query(usersRef, where('email', '==', auth.currentUser.email));
//         const querySnapshot = await getDocs(q);

//         if (querySnapshot.empty) {
//           console.error('No user document found for the current user.');
//           return;
//         }

//         const userData = querySnapshot.docs[0].data();
//         const { userName, dp_url } = userData;

//         setUserData({ userName, dp_url });
//         setNewName(userName);
//         setImageUri(dp_url); // Set the initial imageUri
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const handleImagePick = async () => {
//   try {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 4],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       // Make sure the `assets` array is defined and not empty
//       if (result.assets && result.assets.length > 0) {
//         setnewImageUri(result.assets[0].uri);
//         setImageUri(result.assets[0].uri);
//       } else {
//         console.error('Image picker result is missing the "assets" array or is empty.');
//         Alert.alert('Error', 'Failed to pick image. Please try again.');
//       }
//     }
//   } catch (e) {
//     console.log(e);
//     Alert.alert('Error', 'Failed to pick image. Please try again.');
//   }
// };

  
//   const handleUpdateProfile = async () => {
//     const storageUrl = 'renteasyproject.appspot.com';
//     try {
//       const userDocRef = doc(db, 'users', auth.currentUser.user_id);

//       // Update user name
//       await updateDoc(userDocRef, { userName: newName });

//       // Update profile picture if a new image is selected
//       if (newImageUri) {
//         setloading(true)
//         const fileName = `images/${userRef}_${Date.now()}`;
  
//         try {
//           const response = await fetch(
//             'https://firebasestorage.googleapis.com/v0/b/'+storageUrl+'/o?name='+fileName,
//             {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'image/jpeg' || 'image/png' || 'image/jpg',
//               },
//               body: await fetch(newImageUri).then((response) => response.blob()),
//             }
//           );
    
          
//          } 
//          catch (error) {
//           console.error('Error uploading image:', error);
//         }
//       }

//       // Refresh user data after the update
//       const updatedUserData = { userName: newName, dp_url: newImageUri || userData.dp_url };
//       setUserData(updatedUserData);

//       Alert.alert('Profile Updated', 'Your profile has been successfully updated!');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       Alert.alert('Error', 'Failed to update profile. Please try again.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Edit Profile</Text>
//       {userData && (
//         <View style={styles.profileContainer}>
//           <TouchableOpacity onPress={handleImagePick}>
//             <Image source={{ uri: imageUri || userData.dp_url }} style={styles.image} />
//           </TouchableOpacity>
//           <View style={styles.inputBox}>
//             <Text style={styles.label}>Name:</Text>
//             <TextInput
//               style={styles.textInput}
//               value={newName}
//               onChangeText={(text) => setNewName(text)}
//             />
//           </View>

//           <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
//             <Text style={styles.updateButtonText}>Update Profile</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   profileContainer: {
//     width: '100%',
//     alignItems: 'center',
    
//   },
//   inputBox: {
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     width: '100%',
//   },
//   label: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   textInput: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     width: '100%',
//   },
//   image: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     marginBottom: 20,
//     backgroundColor: '#ccc'
//   },
//   updateButton: {
//     backgroundColor: '#3498db',
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   updateButtonText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default EditProfile
