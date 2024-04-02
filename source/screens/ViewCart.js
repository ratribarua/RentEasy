import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import RentOptionsModal from './RentOptionsModal';

const ViewCart = ({ route }) => {
  const { cartBooks, userName } = route.params;
  const [cartBookDetails, setCartBookDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [bookSelectedDates, setBookSelectedDates] = useState({});

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

  const handleRentNow = (bookId) => {
    setSelectedBookId(bookId);
    setIsModalVisible(true);
  };

  const handleDateChange = (bookId, selectedDate) => {
    setBookSelectedDates(prevState => ({
      ...prevState,
      [bookId]: selectedDate,
    }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Text style={styles.bookTitle}>Title: {item.title}</Text>
      <Text style={styles.bookAuthor}>Author: {item.author}</Text>
      <Text style={styles.bookEdition}>Edition: {item.edition}</Text>
      <TouchableOpacity style={styles.buyNowButton} onPress={() => handleRentNow(item.id)}>
        <Text style={styles.buyNowButtonText}>Rent Now</Text>
      </TouchableOpacity>
      <Text style={styles.bookOwner}>Owner: {item.userName}</Text>
      {bookSelectedDates[item.id] && (
        <Text style={styles.selectedDateText}>Selected Date: {bookSelectedDates[item.id].toDateString()}</Text>
      )}
      <RentOptionsModal
        visible={isModalVisible && selectedBookId === item.id}
        bookId={item.id}
        onClose={() => setIsModalVisible(false)}
        onDateChange={(date) => handleDateChange(item.id, date)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text>Welcome, {userName}!</Text>
      <Text style={styles.header}>Added Books</Text>
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
    color: '#4b0082',
  },
  bookItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 20,
  },
  bookEdition: {
    fontSize: 18,
  },
  bookOwner: {
    fontSize: 18, 
  },
  buyNowButton: {
    backgroundColor: '#4b0082',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  buyNowButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedDateText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ViewCart;
