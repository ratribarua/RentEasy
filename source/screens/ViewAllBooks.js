import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { collection, getDocs, addDoc, query, where, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { db } from './firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

const firestore = getFirestore();

const ViewAllBooks = ({ route }) => {
  const { userName, userId } = route.params;

  const [books, setBooks] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rentLocation, setRentLocation] = useState('');
  const [rentRequestSent, setRentRequestSent] = useState({});

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ownerId: doc.data().userId, // Fetching owner ID
          ...doc.data()
        }));
        setBooks(fetchedBooks);
        initializeRentRequestStatus(fetchedBooks);
        fetchSentRequests();
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

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
      const storedSentRequests = await AsyncStorage.getItem('sentRequests'); // Fetch sent requests from AsyncStorage
      if (storedSentRequests) {
        setRentRequestSent(JSON.parse(storedSentRequests));
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const storeSentRequests = async (sentRequests) => {
    try {
      await AsyncStorage.setItem('sentRequests', JSON.stringify(sentRequests)); // Store sent requests in AsyncStorage
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
      console.log('Rent request sent successfully');
      Alert.alert('Rent Request Sent', `Rent request sent successfully to ${book.ownerId} (${book.userName})`);
      updateRentRequestStatus(book.id, true); // Update rent request status to true for this book
      storeSentRequests({ ...rentRequestSent, [book.id]: true }); // Update AsyncStorage with new sent request
    } catch (error) {
      console.error('Error sending rent request:', error);
    }
  };

  const renderDatePicker = (bookId, ownerId) => {
    if (showDatePicker && ownerId !== userId) {
      return (
        <View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            minimumDate={new Date()} // Set minimum date to today
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
          <Text style={styles.selectedDateText}>Selected Date: {selectedDate.toLocaleDateString()}</Text>
        </View>
      );
    }
  };

  const handleLocationChange = (location) => {
    setRentLocation(location);
  };

  const isRentButtonDisabled = (book) => {
    return !(rentLocation && selectedDate);
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
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>
            {renderDatePicker(item.id, item.ownerId)}
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
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
        <View>
          {showDatePicker && (
            <View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                minimumDate={new Date()} // Set minimum date to today
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
              <Text style={styles.selectedDateText}>Selected Date: {selectedDate.toLocaleDateString()}</Text>
            </View>
          )}
        </View>
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
  divider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
});

export default ViewAllBooks;
