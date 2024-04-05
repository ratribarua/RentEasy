import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

const ViewAllBooks = ({ route }) => {
  const [books, setBooks] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [rentalDetails, setRentalDetails] = useState({ date: '', location: '' });
  const { userName, userId } = route.params;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), rented: false }));
        setBooks(fetchedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const toggleRent = async (bookId, rented, ownerId) => {
    try {
      if (ownerId === userId) {
        Alert.alert('Error', 'You cannot rent your own book.');
        return;
      }
  
      setSelectedBook(bookId);
  
      if (rented) {
        // If already rented, remove the rental details and set rented to false
        const updatedBooks = books.map(book =>
          book.id === bookId ? { ...book, rented: false } : book
        );
        setBooks(updatedBooks);
        await setDoc(doc(db, 'books', bookId), { rented: false }, { merge: true });
      } else {
        // If not rented, show the popup
        setPopupVisible(true);
      }
    } catch (error) {
      console.error('Error toggling book rental status:', error);
    }
  };
  
  

  const handleRent = async () => {
    try {
      const updatedBooks = books.map(book =>
        book.id === selectedBook ? { ...book, rented: true } : book
      );
      setBooks(updatedBooks);
      await setDoc(doc(db, 'books', selectedBook), { rented: true }, { merge: true });
      setPopupVisible(false);
    } catch (error) {
      console.error('Error toggling book rental status:', error);
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
        <TouchableOpacity
          style={[styles.rentButton, item.rented ? styles.removeButton : null]}
          onPress={() => toggleRent(item.id, item.rented, item.userId)}
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

        <Modal
          visible={popupVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPopupVisible(false)}
        >
          <View style={styles.popupContainer}>
            <View style={styles.popup}>
              <Text>Add Date and Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Date"
                value={rentalDetails.date}
                onChangeText={text => setRentalDetails({ ...rentalDetails, date: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={rentalDetails.location}
                onChangeText={text => setRentalDetails({ ...rentalDetails, location: text })}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.popupButton} onPress={() => handleRent()}>
                  <Text style={styles.buttonText}>Enter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.popupButton} onPress={() => setPopupVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupButton: {
    backgroundColor: '#4b0082',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ViewAllBooks;
