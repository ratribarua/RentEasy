import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

const MyBooks = ({ route }) => {
  const { userName, userId } = route.params;
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const q = query(collection(db, 'books'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const userBooksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserBooks(userBooksData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user books:', error);
        setError('Error fetching user books');
        setLoading(false);
      }
    };
    fetchUserBooks();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
      <Text style={styles.sectionTitle}>My Books</Text>
      <FlatList
        data={userBooks}
        renderItem={({ item, index }) => (
          <View style={styles.bookItem}>
            <Image source={{ uri: item.imageURL }} style={styles.bookImage} />
            <Text style={styles.bookTitle}>{index + 1}) Title: {item.title}</Text>
            
            <Text style={styles.bookAuthor}>Author: {item.author}</Text>
            {/* Add other book details */}
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bookItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center', // Center items vertically
  },
  bookImage: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
    marginRight: 10, // Space between image and text
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 20,
    marginBottom: 50, // Space between title and author
  },
  bookAuthor: {
    fontSize: 16,
  },
});


export default MyBooks;
