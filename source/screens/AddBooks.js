import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, Modal, Image } from 'react-native';
import { Avatar, Title, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

const AddBooks = ({ route }) => {
  const { userName } = route.params;

  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookEdition, setNewBookEdition] = useState('');
  const [newBookContent, setNewBookContent] = useState('');
  const [image, setImage] = useState(null);
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access camera was denied');
      }
    })();
  }, []);

  const openCamera = () => {
    setCameraVisible(true);
  };

  const closeCamera = () => {
    setCameraVisible(false);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.takePictureAsync();
        setCapturedImage(uri);
        setImage(uri);
        closeCamera();
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  // Function to handle image selection
  const selectImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 10],
        quality: 1,
      });

      if (!result.cancelled) {
        setImage(result.assets[0].uri);
      } else {
        console.log("Image picking cancelled");
      }

    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handlePostBook = async () => {
    try {
      const imageName = `${newBookTitle}_${Date.now().toString()}`;
      let imageURL = null;

      if (image) {
        imageURL = await uploadImage(imageName);
      }

      const bookData = {
        title: newBookTitle,
        author: newBookAuthor,
        edition: newBookEdition,
        content: newBookContent,
        imageURL: imageURL,
        userName: userName,
      };

      const booksRef = collection(db, 'books');
      await addDoc(booksRef, bookData);

      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookEdition('');
      setNewBookContent('');
      setImage(null);

      Alert.alert('Success', 'Book added successfully');
    } catch (error) {
      console.error('Error posting book:', error);
      Alert.alert('Error', 'Failed to add book. Please try again.');
    }
  };

  const uploadImage = async (imageName) => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const storageInstance = getStorage();
      const imageRef = ref(storageInstance, `bookImages/${imageName}`);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image to Firebase Storage:", error);
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text>Welcome, {userName}!</Text>
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title of the book..."
            value={newBookTitle}
            onChangeText={(text) => setNewBookTitle(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Author of the book..."
            value={newBookAuthor}
            onChangeText={(text) => setNewBookAuthor(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Edition of the book..."
            value={newBookEdition}
            onChangeText={(text) => setNewBookEdition(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Write details about the book..."
            multiline
            value={newBookContent}
            onChangeText={(text) => setNewBookContent(text)}
          />
          <TouchableOpacity onPress={selectImage}>
            <View style={styles.imagePickerContainer}>
              <Icon name="image" color="#4b0082" size={25} />
              <Text style={styles.imagePickerText}>Choose Picture</Text>
            </View>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
          <TouchableOpacity onPress={openCamera}>
            <View style={styles.cameraButtonContainer}>
              <Icon name="camera" color="#4b0082" size={25} />
              <Text style={styles.cameraButtonText}>Take Picture</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handlePostBook}>
            <Text style={styles.buttonText}>Add Book</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isCameraVisible}
          onRequestClose={closeCamera}
        >
          <View style={styles.modalContainer}>
            <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back}>
              <View style={styles.cameraButtons}>
                <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                  <Icon name="camera" color="white" size={30} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraButton} onPress={closeCamera}>
                  <Icon name="close" color="white" size={30} />
                </TouchableOpacity>
              </View>
            </Camera>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    marginTop: 100,
  },
  contentContainer: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 10,
    color: '#4b0082',
    fontSize: 18,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  cameraButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cameraButtonText: {
    marginLeft: 10,
    color: '#4b0082',
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#4b0082',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  cameraButton: {
    backgroundColor: '#4b0082',
    padding: 15,
    borderRadius: 50,
  },
});

export default AddBooks;

