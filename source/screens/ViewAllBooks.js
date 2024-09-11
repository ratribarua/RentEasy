import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_BOOKS } from './queries';
import DateTimePicker from '@react-native-community/datetimepicker';

const ViewAllBooks = ({ route }) => {
  const { userName, userId } = route.params;

  const [rentLocation, setRentLocation] = useState('');
  const [rentRequestSent, setRentRequestSent] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_BOOKS, {
    variables: { searchQuery }
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const books = data.books;

  const handleRentRequest = async (book) => {
    try {
      // Simulate rent request handling
      console.log('Rent request sent successfully');
      Alert.alert('Rent Request Sent', `Rent request sent successfully to ${book.ownerId} (${book.userName})`);
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
      setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    }
    setShowDatePicker(false);
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
    refetch({ searchQuery: query });
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
        {item.userId !== userId ? (
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
                isRentButtonDisabled(item) ? styles.disabledButton : null
              ]}
              onPress={() => handleRentRequest(item)}
              disabled={isRentButtonDisabled(item)}
            >
              <Text style={styles.rentButtonText}>Rent Request</Text>
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
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {selectedDate && (
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
    <View style={styles.container}>
      <Text>Welcome, {userName}!</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Books"
        value={searchQuery}
        onChangeText={handleSearchQueryChange}
      />
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
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
});

export default ViewAllBooks;
