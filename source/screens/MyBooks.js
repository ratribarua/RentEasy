import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { FontAwesome } from '@expo/vector-icons'; // Assuming FontAwesome is already imported

const MyBooks = ({ route }) => {
  const { userName, userId } = route.params;

  const [userBooks, setUserBooks] = useState([]);


  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const q = query(collection(db, 'books'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const userBooksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserBooks(userBooksData);
      } catch (error) {
        console.error('Error fetching user books:', error);
      }
    };
    fetchUserBooks();
  }, [userId]);


  return (
    <View>
      <Text>Welcome, {userName}!</Text>
      <Text>My Books</Text>
      <FlatList
        data={userBooks}
        renderItem={({ item }) => (
          <View>
            <Text>Title: {item.title}</Text>
            <Text>Author: {item.author}</Text>
            {/* Add other book details */}
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  notificationText: {
    flex: 1,
  },
  deleteButton: {
    marginLeft: 10,
  },
});

export default MyBooks;
