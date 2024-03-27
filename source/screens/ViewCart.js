import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ViewCart = ({ route }) => {
  const { cartBooks } = route.params;
  const [cartBookDetails, setCartBookDetails] = useState([]);

  useEffect(() => {
    const fetchCartBookDetails = async () => {
      try {
        const bookDetailsPromises = cartBooks.map(async bookId => {
          const bookDocRef = doc(db, 'books', bookId);
          const bookDocSnapshot = await getDoc(bookDocRef);
          if (bookDocSnapshot.exists()) {
            return { id: bookDocSnapshot.id, ...bookDocSnapshot.data() };
          } else {
            return null;
          }
        });
        const resolvedBookDetails = await Promise.all(bookDetailsPromises);
        setCartBookDetails(resolvedBookDetails.filter(book => book !== null));
      } catch (error) {
        console.error('Error fetching cart book details:', error);
      }
    };

    fetchCartBookDetails();
  }, [cartBooks]);

  const renderItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.bookAuthor}>Author: {item.author}</Text>
      {/* Add other book details */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cart</Text>
      {cartBookDetails.length > 0 ? (
        <FlatList
          data={cartBookDetails}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text>No books in the cart</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bookItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 16,
  },
});

export default ViewCart;
