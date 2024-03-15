import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { collection, where, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db, storage } from './firebaseConfig'; // Make sure to import storage
import * as ImagePicker from 'expo-image-picker';

const  ProfileUpdate = () => {
  const [userData, setUserData] = useState(null);
  const [newName, setNewName] = useState('');
  const [newSemester, setNewSemester] = useState(''); // Added semester state
  const [imageUri, setImageUri] = useState(null);
  const [newImageUri, setnewImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error('No user document found for the current user.');
          return;
        }

        const userData = querySnapshot.docs[0].data();
        const { userName, dp_url, semester } = userData;

        setUserData({ userName, dp_url, semester });
        setNewName(userName);
        setNewSemester(semester);
        setImageUri(dp_url); // Set the initial imageUri
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, []);

  const handleImagePick = async () => {
    try {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 4],
              quality: 1,
            });
        
            if (!result.canceled) {
              // Make sure the `assets` array is defined and not empty
              if (result.assets && result.assets.length > 0) {
                setnewImageUri(result.assets[0].uri);
                setImageUri(result.assets[0].uri);
              } else {
                console.error('Image picker result is missing the "assets" array or is empty.');
                Alert.alert('Error', 'Failed to pick image. Please try again.');
              }
            }
          } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
          }
  };

  const handleUpdateProfile = async () => {
    const storageUrl = 'renteasyproject.appspot.com';
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.user_id);
    
      // Update user name and semester
      await updateDoc(userDocRef, { userName: newName, semester: newSemester });
    
      // Update profile picture if a new image is selected
      if (newImageUri) {
        setLoading(true);
        const fileName = `images/${auth.currentUser.user_id}_${Date.now()}`;
    
        const storageRef = storage.ref();
        const imageRef = storageRef.child(fileName);
    
        try {
          const response = await imageRef.put(await fetch(newImageUri).then((response) => response.blob()));
          const downloadURL = await response.ref.getDownloadURL();
    
          // Update the user document with the new image URL
          await updateDoc(userDocRef, { dp_url: downloadURL });
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
          setLoading(false); // Ensure loading state is set to false after the operation
        }
      }
    
      // Refresh user data after the update
      const updatedUserData = {
        userName: newName,
        semester: newSemester,
        dp_url: newImageUri || userData.dp_url, // Use newImageUri when available, otherwise use userData.dp_url
      };
      setUserData(updatedUserData);
    
      Alert.alert('Profile Updated', 'Your profile has been successfully updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false); // Ensure loading state is set to false after the operation
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      {userData && (
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            <Image source={{ uri: imageUri || userData.dp_url }} style={styles.image} />
          </TouchableOpacity>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.textInput}
              value={newName}
              onChangeText={(text) => setNewName(text)}
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Semester:</Text>
            <TextInput
              style={styles.textInput}
              value={newSemester}
              onChangeText={(text) => setNewSemester(text)}
            />
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileContainer: {
    width: '100%',
    alignItems: 'center',
    
  },
  inputBox: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    backgroundColor: '#ccc'
  },
  updateButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileUpdate