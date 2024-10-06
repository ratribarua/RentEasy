import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ViewAllBooks = ({ route }) => {
  const { userName, userId } = route.params;
  const [booksByMe, setBooksByMe] = useState([]);
  const [booksByOthers, setBooksByOthers] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rentLocation, setRentLocation] = useState('');
  const [rentRequestSent, setRentRequestSent] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ownerId: doc.data().userId,
          ...doc.data()
        }));

        const booksAddedByMe = fetchedBooks.filter(book => book.ownerId === userId);
        const booksAddedByOthers = fetchedBooks.filter(book => book.ownerId !== userId);

        setBooksByMe(booksAddedByMe);
        setBooksByOthers(booksAddedByOthers);
        initializeRentRequestStatus(fetchedBooks);
        fetchSentRequests();
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [userId]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ownerId: doc.data().userId,
          ...doc.data()
        }));

        const filteredBooksByMe = fetchedBooks
          .filter(book => book.ownerId === userId)
          .filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const filteredBooksByOthers = fetchedBooks
          .filter(book => book.ownerId !== userId)
          .filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
          );

        setBooksByMe(filteredBooksByMe);
        setBooksByOthers(filteredBooksByOthers);
        initializeRentRequestStatus(fetchedBooks);
        fetchSentRequests();
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [userId, searchQuery]);

  const initializeRentRequestStatus = (fetchedBooks) => {
    const initialRentRequestStatus = {};
    fetchedBooks.forEach(book => {
      initialRentRequestStatus[book.id] = false;
    });
    setRentRequestSent(initialRentRequestStatus);
  };

  const updateRentRequestStatus = (bookId, status) => {
    setRentRequestSent(prevState => ({
      ...prevState,
      [bookId]: status
    }));
  };

  const fetchSentRequests = async () => {
    try {
      const storedSentRequests = await AsyncStorage.getItem('sentRequests');
      if (storedSentRequests) {
        setRentRequestSent(JSON.parse(storedSentRequests));
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const storeSentRequests = async (sentRequests) => {
    try {
      await AsyncStorage.setItem('sentRequests', JSON.stringify(sentRequests));
    } catch (error) {
      console.error('Error storing sent requests:', error);
    }
  };

  const handleRentRequest = async (book) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        senderName: userName,
        senderId: userId,
        location: rentLocation,
        rentDuration: selectedDate,
        bookTitle: book.title,
        ownerId: book.ownerId,
        status: 'pending',
      });
      Alert.alert('Rent Request Sent', `Rent request sent successfully to ${book.ownerId}`);
      updateRentRequestStatus(book.id, true);
      storeSentRequests({ ...rentRequestSent, [book.id]: true });
    } catch (error) {
      console.error('Error sending rent request:', error);
    }
  };

  const onDateChange = (event, date) => {
    if (event.type === "set" && date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const renderDatePicker = () => {
    return (
      showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        </View>
      )
    );
  };

  const handleLocationChange = (location) => {
    setRentLocation(location);
  };

  const isRentButtonDisabled = (book) => {
    return !(rentLocation && selectedDate);
  };

  const handleDeleteBook = (bookId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this book?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'books', bookId)); // Delete the book from Firestore
              setBooksByMe(prevBooks => prevBooks.filter(book => book.id !== bookId)); // Update local state
              Alert.alert('Book Deleted', 'The book has been successfully deleted.');
            } catch (error) {
              console.error('Error deleting book:', error);
              Alert.alert('Error', 'There was an error deleting the book.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.imageURL }} style={styles.bookImage} />
      <View style={styles.bookDetails}>
        <Text style={styles.bookUserName}>Added By: {item.userName}</Text>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>Author: {item.author}</Text>
        <Text style={styles.bookEdition}>Edition: {item.edition}</Text>
        <Text style={styles.bookContent}>Description: {item.content}</Text>
        {item.ownerId === userId && ( // Show delete icon only for the owner
          <TouchableOpacity onPress={() => handleDeleteBook(item.id)} style={styles.deleteButton}>
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity>
        )}
        {item.ownerId !== userId ? (
          <>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter Location"
              value={rentLocation}
              onChangeText={handleLocationChange}
            />
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>
            {renderDatePicker()}
            {selectedDate && (
              <Text style={styles.selectedDateText}>Selected Date: {selectedDate.toLocaleDateString()}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.rentButton,
                isRentButtonDisabled(item) || rentRequestSent[item.id] ? styles.disabledButton : null
              ]}
              onPress={() => handleRentRequest(item)}
              disabled={isRentButtonDisabled(item) || rentRequestSent[item.id]}
            >
              <Text style={styles.buttonText}>{rentRequestSent[item.id] ? 'Request Sent' : 'Send Rent Request'}</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by title or author..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Text style={styles.sectionHeader}>Books Added By Me</Text>
      {booksByMe.length > 0 ? (
        <FlatList
          data={booksByMe}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text>No books added by you.</Text>
      )}
      <Text style={styles.sectionHeader}>Books Added By Others</Text>
      {booksByOthers.length > 0 ? (
        <FlatList
          data={booksByOthers}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text>No books added by others.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bookItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  bookImage: {
    width: 60,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  bookDetails: {
    flex: 1,
  },
  bookUserName: {
    fontSize: 12,
    color: 'gray',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
    color: 'gray',
  },
  bookEdition: {
    fontSize: 14,
    color: 'gray',
  },
  bookContent: {
    fontSize: 12,
    color: 'black',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  locationInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  datePickerButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  selectedDateText: {
    marginBottom: 10,
  },
  rentButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  datePickerContainer: {
    marginVertical: 10,
  },
});

export default ViewAllBooks;
