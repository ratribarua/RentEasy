import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView , Alert } from 'react-native';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

const ViewAllBooks = ({ route }) => {
  const [books, setBooks] = useState([]); // State to store all books
  const { userName, userId } = route.params; // Extracting user details from route params

  // Fetch all books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books')); // Querying Firestore collection
        const fetchedBooks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), rented: false })); // Mapping query results to an array and adding 'rented' flag
        setBooks(fetchedBooks); // Setting fetched books to state
      } catch (error) {
        console.error('Error fetching books:', error); // Handling errors
      }
    };

    fetchBooks(); // Invoking the fetchBooks function
  }, []);


  
  // Function to handle renting or removing a book
const toggleRent = async (bookId, rented, ownerId) => {
  try {
    // Check if the current user is the owner of the book
    if (ownerId === userId) {
      Alert.alert('Error', 'You cannot rent your own book.'); // Show alert message
      return;
    }

    console.log(`${rented ? 'Removing' : 'Renting'} book with ID: ${bookId}`); // Log the action and book ID
    const updatedBooks = books.map(book =>
      book.id === bookId ? { ...book, rented: !rented } : book
    ); // Toggle the 'rented' flag for the selected book
    setBooks(updatedBooks); // Update the books state

    // Update the Firestore document with the new 'rented' status
    await setDoc(doc(db, 'books', bookId), { rented: !rented }, { merge: true });
  } catch (error) {
    console.error('Error toggling book rental status:', error); // Handling errors
  }
};



  // Render each book item
  const renderItem = ({ item }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookDetails}>
        <Text style={styles.bookUserName}>Added By: {item.userName}</Text>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>Author: {item.author}</Text>
        <Text style={styles.bookEdition}>Edition: {item.edition}</Text>
        <Text style={styles.bookContent}>Description: {item.content}</Text>
        <TouchableOpacity
          style={[styles.rentButton, item.rented ? styles.removeButton : null]}
          onPress={() => toggleRent(item.id, item.rented,item.userId)}
        >
          <Text style={styles.rentButtonText}>{item.rented ? 'Remove' : 'Rent Now'}</Text>
        </TouchableOpacity>
      </View>
      <Image source={{ uri: item.imageURL }} style={styles.bookImage} />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text>Welcome, {userName}!</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.header}>All Books</Text>
        </View>

        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4b0082',
  },
  bookItem: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookDetails: {
    flex: 1,
    padding: 10,
  },
  bookImage: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 16,
  },
  bookEdition: {
    fontSize: 16,
  },
  bookContent: {
    fontSize: 14,
  },
  bookUserName: {
    color: "#4b0082",
    fontSize: 20,
  },
  rentButton: {
    backgroundColor: '#4b0082',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  rentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#00bfff', // Change to your desired color for the remove button
  },
  
});

export default ViewAllBooks;
