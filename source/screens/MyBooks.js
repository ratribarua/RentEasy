import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const MyBooks = ({ route }) => {
  const { userName, userId } = route.params;
  console.log("Route Params:", route.params);

  const [userBooks, setUserBooks] = useState([]);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const q = query(collection(db, 'books'), where('userId', '==', userId)); // Updated query to filter books by userId
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

export default MyBooks;

const styles = StyleSheet.create({});
