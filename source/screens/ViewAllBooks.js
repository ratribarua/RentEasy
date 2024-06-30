import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

const ViewAllBooks = ({ route }) => {
  const { userName, userId } = route.params;

  const [books, setBooks] = useState([]);
  const [rentLocation, setRentLocation] = useState('');
  const [rentRequestSent, setRentRequestSent] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ownerId: doc.data().userId,
          ...doc.data()
        }));
        setBooks(fetchedBooks);
        setFilteredBooks(fetchedBooks); // Initialize filtered books
        initializeRentRequestStatus(fetchedBooks);
        fetchSentRequests();
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, books]);

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
        bookTitle: book.title,
        ownerId: book.ownerId,
        status: 'pending',
        date: selectedDate // Include selected date in the request
      });
      console.log('Rent request sent successfully');
      Alert.alert('Rent Request Sent', `Rent request sent successfully to ${book.ownerId} (${book.userName})`);
      updateRentRequestStatus(book.id, true);
      storeSentRequests({ ...rentRequestSent, [book.id]: true });
    } catch (error) {
      console.error('Error sending rent request:', error);
    }
  };

  const handleLocationChange = (location) => {
    setRentLocation(location);
  };

  const isRentButtonDisabled = (book) => {
    return !rentLocation || !selectedDate;
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateChange = (event, date) => {
    if (date !== undefined) {
      // Set only the date portion
      setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    }
    setShowDatePicker(false);
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  const filterBooks = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(lowercasedQuery) ||
      book.author.toLowerCase().includes(lowercasedQuery) ||
      book.userName.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredBooks(filtered);
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.imageURL }} style={styles.bookImage} />
      <View style={styles.bookDetails}>
        <Text style={styles.bookUserName}>Added By: {item.userName}</Text>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>Author: {item.author}</Text>
        <Text style={styles.bookEdition}>Edition: {item.edition}</Text>
        <Text style={styles.bookContent}>Description: {item.content}</Text>
        {item.ownerId !== userId ? (
          <>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter Location"
              value={rentLocation}
              onChangeText={handleLocationChange}
            />
            <TouchableOpacity
              style={[
                styles.rentButton,
                isRentButtonDisabled(item) || rentRequestSent[item.id] ? styles.disabledButton : null
              ]}
              onPress={() => handleRentRequest(item)}
              disabled={isRentButtonDisabled(item) || rentRequestSent[item.id]}
            >
              <Text style={styles.rentButtonText}>{rentRequestSent[item.id] ? "Sent" : "Rent Request"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={toggleDatePicker}
            >
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date" // Set mode to 'date' to display only date
                display="default"
                onChange={handleDateChange}
              />
            )}
            {selectedDate && rentRequestSent[item.id] && (
              <Text style={styles.selectedDateText}>Requested Date: {selectedDate.toDateString()}</Text>
            )}
          </>
        ) : (
          <Text style={styles.ownedBookText}>You Own This Book</Text>
        )}
      </View>
    </View>
  );
  
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text>Welcome, {userName}!</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.header}>All Books</Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Books"
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
        />
        <FlatList
          data={filteredBooks}
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
    width: 120,
    height: 200,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  rentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  datePickerButton: {
    backgroundColor: '#4b0082',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  ownedBookText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  selectedDateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4b0082',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default ViewAllBooks;
