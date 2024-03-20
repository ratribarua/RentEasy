import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { collection, where, query, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from './firebaseConfig'; // Make sure to import storage
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const  ProfileUpdate = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  const [newName, setNewName] = useState('');
  const [isUserNameAvailable, setIsUserNameAvailable] = useState(true); 

  
  const [newSemester, setNewSemester] = useState('');
  const [userId, setUserId] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [newImageUri, setNewImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const q = query(collection(db, 'users'), where('email', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          console.error('No user document found for the current user.');
          return;
        }
  
        const userData = querySnapshot.docs[0].data();
        const { userName, dp_url, semester } = userData;
        const userId = querySnapshot.docs[0].id; 
  
        setUserData({ userName, dp_url, semester });
        setNewName(userName);
        setNewSemester(semester);
        setUserId(userId);
        setImageUri(dp_url);
      } catch (error) {
        console.error('Error fetching user data:', error);
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
        if (result.assets && result.assets.length > 0) {
          setNewImageUri(result.assets[0].uri);
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
  // Function to check unique username
  const checkUniqueUserName = async (userName) => {
    try {
      const q = query(collection(db, 'users'), where('userName', '==', userName));
      const querySnapshot = await getDocs(q);

      setIsUserNameAvailable(querySnapshot.empty);
    } catch (error) {
      console.error('Error checking unique username:', error);
    }
  };

  const handleUpdateProfile = async (navigation) => {
    console.log('Updating profile...');
    setLoading(true);

    if (!isUserNameAvailable) {
      Alert.alert('Error', 'Username is already taken. Please choose a different one.');
      setLoading(false);
      return;
    }
  
    try {
      const userDocRef = doc(db, 'users', userId); // Use userId from state
  
      // Update user name and semester
      await updateDoc(userDocRef, { userName: newName, semester: newSemester });
      console.log('User name and semester updated successfully.');
  
      // Update profile picture if a new image is selected
      if (newImageUri) {
        console.log('Uploading new profile picture...');
        const fileName = `Images/${newName}_${Date.now()}`;
  
        // Get a reference to the storage service
        const storageRef = ref(storage, fileName);
  
        // Convert data URL to Blob
        const blob = await (await fetch(newImageUri)).blob();
  
        // Upload file to Firebase Storage using put
        const uploadTask = uploadBytes(storageRef, blob);
  
        // Wait for the upload to complete
        await uploadTask;
  
        // Get download URL and update the user document with the new image URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log('New profile picture uploaded successfully:', downloadURL);
  
        // Update the user document with the new image URL
        await updateDoc(userDocRef, { dp_url: downloadURL });
        console.log('User document updated with new profile picture URL.');
  
        // Refresh user data to reflect the updated image URL
        const updatedUserData = { ...userData, dp_url: downloadURL };
        setUserData(updatedUserData);
      }
  
      // Fetch updated user data after profile update
      const updatedUserSnapshot = await getDoc(userDocRef);
      const updatedUserData = updatedUserSnapshot.data();
      setUserData(updatedUserData);

   // Update user name in the blogs collection
const blogsRef = collection(db, 'blogs');
const querySnapshot = await getDocs(query(blogsRef, where('userId', '==', userId))); // Filter blogs by userId
querySnapshot.forEach(async (blogDoc) => {
  try {
    const blogDocRef = doc(db, 'blogs', blogDoc.id); // Use blogDoc.id as the document ID
    await updateDoc(blogDocRef, { userName: newName }); // Update userName in each blog
  } catch (error) {
    console.error('Error updating userName in blog:', error);
  }
});



  
      // Alert the user about the successful profile update
      Alert.alert('Profile Updated', 'Your profile has been successfully updated!', [
        {
          text: 'OK',
          onPress: () => {
            // Logout the user
            handleLogout(navigation);
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };
  
  
  

  
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      {userData && (
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            <Image source={{ uri: imageUri || userData.dp_url }} style={styles.image} />
          </TouchableOpacity>


          {/*unique name */}
          <View style={styles.inputBox}>
          <Text style={styles.label}>Name:</Text>
         <TextInput
         style={styles.textInput}
         value={newName}
           onChangeText={(text) => {
        setNewName(text);
        checkUniqueUserName(text);
          }}
          />
        {isUserNameAvailable && <Text style={{ color: 'green' }}>Username is available.</Text>}
       {!isUserNameAvailable && <Text style={{ color: 'red' }}>Username is already taken.</Text>}
        </View>



          <View style={styles.inputBox}>
            <Text style={styles.label}>Semester:</Text>
            <TextInput
              style={styles.textInput}
              value={newSemester}
              onChangeText={(text) => setNewSemester(text)}
            />
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdateProfile(navigation)}>
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