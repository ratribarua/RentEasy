// Import necessary dependencies
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from 'firebase/firestore';

const PostBookScreen = () => {
  const navigation = useNavigation();
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');

  const handlePost = async () => {
    try {
      // Add the book details to Firebase Firestore
      await firestore().collection('books').add({
        title: bookTitle,
        author: author,
        likes: 0, // You can customize your data structure as needed
      });

      // Navigate to the home screen or any other screen after posting
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error posting book:', error);
    }
  };

  return (
    <View>
      <Text>Post a Book for Rent</Text>
      <TextInput
        placeholder="Book Title"
        value={bookTitle}
        onChangeText={(text) => setBookTitle(text)}
      />
      <TextInput
        placeholder="Author"
        value={author}
        onChangeText={(text) => setAuthor(text)}
      />
      <Button title="Post" onPress={handlePost} />
    </View>
  );
};

export default PostBookScreen;
