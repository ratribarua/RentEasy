import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ViewAllBooks = ({ route, navigation }) => {
  const [books, setBooks] = useState([]);
  const [cartBooks, setCartBooks] = useState([]);
  const { userName } = route.params;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(fetchedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchCartBooks = async () => {
      try {
        const userDocRef = doc(db, 'carts', userName);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setCartBooks(userData.books || []);
        }
      } catch (error) {
        console.error('Error fetching cart books:', error);
      }
    };

    fetchCartBooks();
  }, [userName]);

  // Function to handle adding a book to the cart
  const addToCart = async (bookId) => {
    try {
      const updatedCartBooks = [...cartBooks, bookId];
      await setDoc(doc(db, 'carts', userName), { books: updatedCartBooks });
      setCartBooks(updatedCartBooks);
      console.log('Book added to cart:', bookId);
    } catch (error) {
      console.error('Error adding book to cart:', error);
    }
  };

  // Function to handle removing a book from the cart
  const removeFromCart = async (bookId) => {
    try {
      const updatedCartBooks = cartBooks.filter(id => id !== bookId);
      await setDoc(doc(db, 'carts', userName), { books: updatedCartBooks });
      setCartBooks(updatedCartBooks);
      console.log('Book removed from cart:', bookId);
    } catch (error) {
      console.error('Error removing book from cart:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookDetails}>
        <Text style={styles.bookUserName}>Added By: {item.userName}</Text>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>Author: {item.author}</Text>
        <Text style={styles.bookEdition}>Edition: {item.edition}</Text>
        <Text style={styles.bookContent}>Description: {item.content}</Text>
        {cartBooks.includes(item.id) ? (
          <TouchableOpacity style={styles.removeFromCartButton} onPress={() => removeFromCart(item.id)}>
            <Text style={styles.removeFromCartButtonText}>Remove from Cart</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item.id)}
          >
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
      <Image source={{ uri: item.imageURL }} style={styles.bookImage} />
    </View>
  );

// Navigate to the cart page
const navigateToCart = () => {
  navigation.navigate('ViewCart', { cartBooks });
};


  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.header}>All Books</Text>
        <Text>Welcome, {userName}!</Text>
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
        <TouchableOpacity style={styles.viewCartButton} onPress={navigateToCart}>
          <Text style={styles.viewCartButtonText}>View Cart</Text>
        </TouchableOpacity>
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
    //marginTop: 5,
    fontSize: 14,
  },
  bookUserName: {
    color:"#4b0082",
    fontSize: 20,
  },
  addToCartButton: {
    backgroundColor: '#4b0082',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  removeFromCartButton: {
    backgroundColor: '#00bfff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  removeFromCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  viewCartButton: {
    backgroundColor: '#4b0082',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  viewCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ViewAllBooks;
