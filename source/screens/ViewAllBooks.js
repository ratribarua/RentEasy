import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Ensure this path is correct
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Main component to view all books
const ViewAllBooks = ({ route }) => {
  const { userName, userId } = route.params;
  const [booksByMe, setBooksByMe] = useState([]);
  const [booksByOthers, setBooksByOthers] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rentLocation, setRentLocation] = useState('');
  const [rentRequestSent, setRentRequestSent] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Effect to fetch books from Firestore on userId change
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ownerId: doc.data().userId,
          ...doc.data()
        }));

        // Separate books into those added by the current user and others
        const booksAddedByMe = fetchedBooks.filter(book => book.ownerId === userId);
        const booksAddedByOthers = fetchedBooks.filter(book => book.ownerId !== userId);

        // Update state with the fetched books
        setBooksByMe(booksAddedByMe);
        setBooksByOthers(booksAddedByOthers);
        initializeRentRequestStatus(fetchedBooks); // Initialize rent request status
        fetchSentRequests(); // Fetch any previously sent requests
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [userId]);

  // Fetch previously sent rent requests (example implementation)
  const fetchSentRequests = () => {
    // Logic to fetch and update rentRequestSent status
  };

  // Initialize rent request status (example implementation)
  const initializeRentRequestStatus = (fetchedBooks) => {
    const initialRentStatus = {};
    fetchedBooks.forEach(book => {
      initialRentStatus[book.id] = false; // Assuming no requests sent initially
    });
    setRentRequestSent(initialRentStatus);
  };

  // Function to determine if the rent button should be disabled
  const isRentButtonDisabled = (book) => {
    return rentRequestSent[book.id] || book.isRented; // Assuming `isRented` is a property indicating if the book is currently rented
  };

  // Handle printing my books
  const handlePrintMyBooks = async () => {
    try {
      const booksList = booksByMe.map(book => `
        <tr>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.edition}</td>
        </tr>
      `).join('');

      const totalBooks = booksByMe.length;

      const html = `
        <html>
          <head>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Your Uploaded Books</h1>
            <h2>User: ${userName}</h2> <!-- Display the user's name -->
            <h2>Total Books: ${totalBooks}</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Edition</th>
                </tr>
              </thead>
              <tbody>
                ${booksList}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error printing books:', error);
      Alert.alert('Error', 'There was an error generating the PDF.');
    }
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
        {item.ownerId === userId && (
          <TouchableOpacity onPress={() => handleDeleteBook(item.id)} style={styles.deleteButton}>
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity>
        )}
        {item.ownerId !== userId && (
          <>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter Location"
              value={rentLocation}
              onChangeText={setRentLocation}
            />
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>
            {showDatePicker && renderDatePicker()}
            {selectedDate && (
              <Text style={styles.selectedDateText}>Selected Date: {selectedDate.toLocaleDateString()}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.rentButton,
                isRentButtonDisabled(item) ? styles.disabledButton : null
              ]}
              onPress={() => handleRentRequest(item)}
              disabled={isRentButtonDisabled(item)}
            >
              <Text style={styles.buttonText}>{rentRequestSent[item.id] ? 'Request Sent' : 'Send Rent Request'}</Text>
            </TouchableOpacity>
          </>
        )}
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
      <TouchableOpacity style={styles.printButton} onPress={handlePrintMyBooks}>
        <Text style={styles.buttonText}>Print My Books</Text>
      </TouchableOpacity>
      <FlatList
        data={booksByOthers.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()))}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
      />
      <FlatList
        data={booksByMe}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  printButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  bookItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bookImage: {
    width: 60,
    height: 90,
    marginRight: 10,
  },
  bookDetails: {
    flex: 1,
  },
  bookUserName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
  },
  bookEdition: {
    fontSize: 14,
  },
  bookContent: {
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  locationInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  datePickerButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  selectedDateText: {
    marginBottom: 8,
  },
  rentButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ViewAllBooks;
