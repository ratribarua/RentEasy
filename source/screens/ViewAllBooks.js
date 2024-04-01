import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

const ViewAllBooks = ({ route, navigation }) => {
  const [books, setBooks] = useState([]); // State to store all books
  const [cartBooks, setCartBooks] = useState([]); // State to store books in the cart
  const { userName, userId } = route.params; // Extracting user details from route params

  // Fetch all books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books')); // Querying Firestore collection
        const fetchedBooks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Mapping query results to an array
        setBooks(fetchedBooks); // Setting fetched books to state
      } catch (error) {
        console.error('Error fetching books:', error); // Handling errors
      }
    };

    fetchBooks(); // Invoking the fetchBooks function
  }, []);

  // Fetch cart books for the current user from Firestore
  useEffect(() => {
    const fetchCartBooks = async () => {
      try {
        const userDocRef = doc(db, 'carts', userId); // Reference to the user's cart document
        const userDocSnap = await getDoc(userDocRef); // Fetching the cart document
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data(); // Extracting cart data
          setCartBooks(userData.books || []); // Setting cart books to state, or an empty array if no books are found
        }
      } catch (error) {
        console.error('Error fetching cart books:', error); // Handling errors
      }
    };

    fetchCartBooks(); // Invoking the fetchCartBooks function
  }, [userId]); // Dependency array to re-run effect when userId changes

  // Function to handle adding a book to the cart
  const addToCart = async (bookId, bookOwner) => {
    try {
      // Check if the book owner is the same as the current user
      if (bookOwner === userId) {
        Alert.alert('Error', 'You cannot add your own book to the pocket.'); // Alert user if they try to add their own book
        return;
      }
      const updatedCartBooks = [...cartBooks, bookId]; // Creating a new array with the added book
      await setDoc(doc(db, 'carts', userId), { books: updatedCartBooks }); // Updating the cart document in Firestore
      setCartBooks(updatedCartBooks); // Setting the updated cart books to state
      console.log('Book added to cart:', bookId); // Logging success
    } catch (error) {
      console.error('Error adding book to cart:', error); // Handling errors
    }
  };

  // Function to handle removing a book from the cart
  const removeFromCart = async (bookId) => {
    try {
      const updatedCartBooks = cartBooks.filter(id => id !== bookId); // Filtering out the removed book
      await setDoc(doc(db, 'carts', userId), { books: updatedCartBooks }); // Updating the cart document in Firestore
      setCartBooks(updatedCartBooks); // Setting the updated cart books to state
      console.log('Book removed from cart:', bookId); // Logging success
    } catch (error) {
      console.error('Error removing book from cart:', error); // Handling errors
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
        {cartBooks.includes(item.id) ? (
          <TouchableOpacity style={styles.removeFromCartButton} onPress={() => removeFromCart(item.id)}>
            <Text style={styles.removeFromCartButtonText}>Remove from Pocket</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item.id, item.userId)} // Pass book owner's userId
          >
            <Text style={styles.addToCartButtonText}>Add to Pocket</Text>
          </TouchableOpacity>
        )}
      </View>
      <Image source={{ uri: item.imageURL }} style={styles.bookImage} />
    </View>
  );

  // Navigate to the cart page
  const navigateToCart = () => {
    navigation.navigate('ViewCart', { cartBooks, userName });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text>Welcome, {userName}!</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.header}>All Books</Text>
          <TouchableOpacity onPress={navigateToCart} style={{ marginLeft: 230 }}>
            <FontAwesome name="shopping-cart" size={40} color="#4b0082" />
            {cartBooks.length > 0 && (
              <View style={styles.cartItemCount}>
                <Text style={styles.cartItemCountText}>{cartBooks.length}</Text>
              </View>
            )}
          </TouchableOpacity>
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
  cartItemCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    minHeight: 20,
  },
  cartItemCountText: {
    color: 'white',
    fontSize: 12,
  }
});

export default ViewAllBooks;
