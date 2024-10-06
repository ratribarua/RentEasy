import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { collection, getDocs, addDoc, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to store data locally
import { db } from './firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker'; // Date picker component for selecting the rent duration

const firestore = getFirestore();

const ViewAllBooks = ({ route }) => {
  const { userName, userId } = route.params; // Extract userName and userId from navigation parameters

  // State to store books added by the user and by others
  const [booksByMe, setBooksByMe] = useState([]);
  const [booksByOthers, setBooksByOthers] = useState([]);
  // State for date picker visibility and selected date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // State for location input and rent request status tracking
  const [rentLocation, setRentLocation] = useState('');
  const [rentRequestSent, setRentRequestSent] = useState({});
  // State for search query input
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch books from Firestore and categorize them as added by the user or others
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books')); // Fetch all books from the Firestore 'books' collection
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ownerId: doc.data().userId, // Store owner ID of the book
          ...doc.data()
        }));

        const booksAddedByMe = fetchedBooks.filter(book => book.ownerId === userId); // Books added by the current user
        const booksAddedByOthers = fetchedBooks.filter(book => book.ownerId !== userId); // Books added by others

        setBooksByMe(booksAddedByMe); // Set state with books added by the user
        setBooksByOthers(booksAddedByOthers); // Set state with books added by others
        initializeRentRequestStatus(fetchedBooks); // Initialize rent request status
        fetchSentRequests(); // Fetch previously sent rent requests from AsyncStorage
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks(); // Call fetchBooks when the component mounts
  }, [userId]); // Only re-fetch books when userId changes

  // Add search functionality: filters books by title or author based on searchQuery input
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ownerId: doc.data().userId,
          ...doc.data()
        }));

        // Filter books added by the user based on the search query
        const filteredBooksByMe = fetchedBooks
          .filter(book => book.ownerId === userId)
          .filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
          );

        // Filter books added by others based on the search query
        const filteredBooksByOthers = fetchedBooks
          .filter(book => book.ownerId !== userId)
          .filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
          );

        setBooksByMe(filteredBooksByMe); // Set filtered books added by the user
        setBooksByOthers(filteredBooksByOthers); // Set filtered books added by others
        initializeRentRequestStatus(fetchedBooks); // Reinitialize rent request status
        fetchSentRequests(); // Fetch previously sent requests from AsyncStorage
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks(); // Call fetchBooks when searchQuery changes
  }, [userId, searchQuery]); // Update books when userId or searchQuery changes

  // Initialize rent request status for each book
  const initializeRentRequestStatus = (fetchedBooks) => {
    const initialRentRequestStatus = {};
    fetchedBooks.forEach(book => {
      initialRentRequestStatus[book.id] = false; // Initially, no rent requests are sent
    });
    setRentRequestSent(initialRentRequestStatus);
  };

  // Update rent request status for a specific book
  const updateRentRequestStatus = (bookId, status) => {
    setRentRequestSent(prevState => ({
      ...prevState,
      [bookId]: status // Set rent request status to true for the selected book
    }));
  };

  // Fetch sent rent requests from AsyncStorage to persist data across app reloads
  const fetchSentRequests = async () => {
    try {
      const storedSentRequests = await AsyncStorage.getItem('sentRequests'); // Retrieve sent requests from local storage
      if (storedSentRequests) {
        setRentRequestSent(JSON.parse(storedSentRequests)); // Parse and set the state
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  // Store rent requests in AsyncStorage to persist the data
  const storeSentRequests = async (sentRequests) => {
    try {
      await AsyncStorage.setItem('sentRequests', JSON.stringify(sentRequests)); // Save sent requests in local storage
    } catch (error) {
      console.error('Error storing sent requests:', error);
    }
  };

  // Handle sending rent request to the book owner
  const handleRentRequest = async (book) => {
    try {
      // Add rent request to the 'notifications' collection in Firestore
      await addDoc(collection(db, 'notifications'), {
        senderName: userName,
        senderId: userId,
        location: rentLocation,
        rentDuration: selectedDate,
        bookTitle: book.title,
        ownerId: book.ownerId,
        status: 'pending',
      });
      console.log('Rent request sent successfully');
      Alert.alert('Rent Request Sent', `Rent request sent successfully to ${book.ownerId}`);
      updateRentRequestStatus(book.id, true); // Update rent request status to 'true' for this book
      storeSentRequests({ ...rentRequestSent, [book.id]: true }); // Persist the updated request status in AsyncStorage
    } catch (error) {
      console.error('Error sending rent request:', error);
    }
  };

  // Render Date Picker component when the user wants to select a rent duration
  const renderDatePicker = (bookId, ownerId) => {
    return showDatePicker && (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        minimumDate={new Date()} // Prevent selecting past dates
        onChange={(event, date) => {
          if (event.type === "set" && date) {
            setSelectedDate(date); // Set the selected date
          }
          setShowDatePicker(false); // Hide date picker after date selection
        }}
      />
    );
  };

  // Handle location input for the rent request
  const handleLocationChange = (location) => {
    setRentLocation(location);
  };

  // Disable rent button if location and date are not selected or if a request is already sent
  const isRentButtonDisabled = (book) => {
    return !(rentLocation && selectedDate);
  };

  // Render a single book item in the FlatList
  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.imageURL }} style={styles.bookImage} />
      <View style={styles.bookDetails}>
        <Text style={styles.bookUserName}>Added By: {item.userName}</Text>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>Author: {item.author}</Text>
        <Text style={styles.bookEdition}>Edition: {item.edition}</Text>
        <Text style={styles.bookContent}>Description: {item.content}</Text>
        {item.ownerId !== userId ? ( // Show rent request options if the book belongs to another user
          <>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter Location"
              value={rentLocation}
              onChangeText={handleLocationChange} // Capture location input
            />
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>
            {renderDatePicker(item.id, item.ownerId)} {/* Render DatePicker for this book */}
            {selectedDate && item.ownerId !== userId && (
              <Text style={styles.selectedDateText}>Selected Date: {selectedDate.toLocaleDateString()}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.rentButton,
                isRentButtonDisabled(item) || rentRequestSent[item.id] ? styles.disabledButton : null
              ]}
              onPress={() => handleRentRequest(item)} // Handle rent request button click
              disabled={isRentButtonDisabled(item) || rentRequestSent[item.id]} // Disable if conditions are not met
            >
              <Text style={styles.buttonText}>{rentRequestSent[item.id] ? 'Request Sent' : 'Send Rent Request'}</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by title or author..."
        value={searchQuery}
        onChangeText={setSearchQuery} // Capture search input and trigger book filtering
      />
      <Text style={styles.sectionHeader}>Books Added By Me</Text>
      {booksByMe.length > 0 ? ( // Render FlatList for books added by the user
        <FlatList
          data={booksByMe}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text>No books added by you.</Text>
      )}
      <Text style={styles.sectionHeader}>Books Added By Others</Text>
      {booksByOthers.length > 0 ? ( // Render FlatList for books added by others
        <FlatList
          data={booksByOthers}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text>No books added by others.</Text>
      )}
    </ScrollView>
  );
};

// Define styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  searchBar: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  bookImage: {
    width: 80,
    height: 120,
    marginRight: 10,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookUserName: {
    fontWeight: 'bold',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontStyle: 'italic',
  },
  bookEdition: {
    fontSize: 14,
    color: '#666',
  },
  bookContent: {
    fontSize: 14,
    color: '#666',
  },
  locationInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
    paddingVertical: 5,
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  selectedDateText: {
    fontSize: 14,
    color: '#333',
  },
  rentButton: {
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ViewAllBooks;
