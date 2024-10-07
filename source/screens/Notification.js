import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';


// Component for displaying a single notification item
const NotificationItem = ({ notification, notifications, onApprove, onCancelApproval, onDecline, showButton }) => {
  const [showInput, setShowInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(notification.ownerPhoneNumber || '');

  // Check if the rent duration has expired
  const isExpired = notification.rentDuration
    ? new Date(notification.rentDuration.seconds * 1000) < new Date()
    : false;

    const handleApprove = async () => {
      try {
        // Define a regular expression for a valid phone number (11 digits)
        const phoneRegex = /^\d{11}$/;

        //approve button will not work without phone number
        if (showInput && phoneNumber.trim() === '') {
          Alert.alert('Error', 'Please enter a phone number.');
          return;
        }
        
        // Check if the phone number matches the expected format
        if (!phoneRegex.test(phoneNumber)) {
          Alert.alert('Error', 'Please enter a valid 11-digit phone number.');
          return;
        }
    
         // Update the notification status and phone number in Firestore
        await updateDoc(doc(db, 'notifications', notification.id), {
          status: 'approved',
          ownerPhoneNumber: phoneNumber.trim(),
        });
        
        // Update other notifications related to the same book
        const otherNotifications = notifications.filter(
          otherNotification =>
            otherNotification.id !== notification.id && otherNotification.bookId === notification.bookId
        );
    
        for (const otherNotification of otherNotifications) {
          await updateDoc(doc(db, 'notifications', otherNotification.id), {
            status: 'Book is not available',
          });
        }
    
        Alert.alert('Approval Successful', 'Request approved successfully.');
        onApprove(notification.id);
      } catch (error) {
        console.error('Error approving request:', error);
      }
    };
    
  

    // Function to handle cancellation of approval
  const handleCancelApproval = async () => {
    try {
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'pending',
        ownerPhoneNumber: '',
      });
      onCancelApproval(notification.id);
      Alert.alert('Approval Canceled', 'Approval has been canceled successfully.');
    } catch (error) {
      console.error('Error canceling approval:', error);
    }
  };


    // Function to handle declining the notification
  const handleDecline = async () => {
    try {
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'request declined',
      });
      onDecline(notification.id); 
      //After the document is successfully updated, the line onDecline(notification.id); calls a callback function named onDecline, sending it the ID of the notification that was declined. This allows the parent component to perform additional actions, such as refreshing the list of notifications or updating the user interface to reflect the change.
      Alert.alert('Request Declined', 'The request has been declined.');
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };



  return (
    <View style={[
      styles.notificationItem, 
      isExpired && styles.expiredBox,
      notification.status === 'approved' && styles.approvedBox
    ]}>
      <Text style={styles.notificationText}>Sender: {notification.senderName}</Text>
      <Text style={styles.notificationText}>Book Title: {notification.bookTitle}</Text>
      <Text style={styles.notificationText}>Location: {notification.location}</Text>
      {notification.rentDuration && (
        <Text style={[styles.notificationText, isExpired && styles.expiredText]}>
          Rent Duration: {new Date(notification.rentDuration.seconds * 1000).toLocaleDateString()}
        </Text>
      )}
      {showButton && notification.status === 'pending' && (
        <>
          <TouchableOpacity style={styles.approveButton} onPress={() => setShowInput(true)}>
            <Text style={styles.buttonText}>Approve Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
            <Text style={styles.buttonText}>Decline Request</Text>
          </TouchableOpacity>
        </>
      )}
      {showInput && ( // Show input field for phone number when approved
        <View>
          <TextInput
            style={styles.phoneNumberInput}
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
      {showButton && notification.status === 'approved' && ( // Show cancel approval button if the request is approved
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelApproval}>
          <Text style={styles.buttonText}>Cancel Approval</Text>
        </TouchableOpacity>
      )}
      {!showButton && ( // Display status and phone number if buttons are not shown
        <View>
          <Text style={styles.notificationText}>Status: {notification.status}</Text>
          {notification.ownerPhoneNumber && (
            <Text style={styles.notificationText}>Phone Number: {notification.ownerPhoneNumber}</Text>
          )}
          {notification.status === 'approved' && isExpired && (
            <Text style={styles.notificationText}>Book is not returned yet.</Text>
          )}
        </View>
      )}
    </View>
  );
};



// Main Notification component to handle fetching and displaying notifications
const Notification = ({ route }) => {
  const { userName, userId } = route.params;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchMode, setFetchMode] = useState('receiving');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!userId) { // If no user ID is provided, stop loading
          setLoading(false);
          return;
        }

        let q; // Query variable
        if (fetchMode === 'sending') {  // Determine query based on fetch mode wether it is sneding or recieving
          q = query(collection(db, 'notifications'), where('senderId', '==', userId));
        } else {
          q = query(collection(db, 'notifications'), where('ownerId', '==', userId));
        }

        const querySnapshot = await getDocs(q);// Fetch notifications from Firestore
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          senderName: doc.data().senderName,
          senderId: doc.data().senderId,
          ownerPhoneNumber: doc.data().ownerPhoneNumber || '',
          rentDuration: doc.data().rentDuration || '',
          ...doc.data(),// Spread other notification data

        }));
        setNotifications(fetchedNotifications); // Update state with fetched notifications
        setLoading(false); // Stop loading
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);// Set error state
        setLoading(false);// Stop loading
      }
    };

    fetchNotifications();// Call the fetch function
  }, [userId, fetchMode]);// Dependency array for userId and fetchMode


// Function to toggle between sending and receiving notifications
  const toggleMode = () => {
    setFetchMode(prevMode => (prevMode === 'sending' ? 'receiving' : 'sending'));
  };



  ///////////////// // Handlers for approving, canceling approval, and declining notifications/////////////
  const handleApproveRequest = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'approved' } : notification
      )
    );
  };
  //notification => ...: For each notification:
  //If notification.id === notificationId, it returns a new notification object with the same properties as the original but with the status set to 'approved'.
  //If the IDs don't match, it returns the original notification unchanged.

  const handleCancelApproval = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'pending', ownerPhoneNumber: '' } : notification
      )
    );
  };

  const handleDeclineRequest = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'request declined' } : notification
      )
    );
  };


  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity onPress={toggleMode}>
          <Text style={styles.toggleButton}>
            {fetchMode === 'sending' ? 'View Receiving Notifications' : 'View Sending Notifications'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>
          {fetchMode === 'sending' ? 'Sending Notifications' : 'Receiving Notifications'}
        </Text>
        {loading && <Text>Loading...</Text>}
        {error && <Text>Error: {error}</Text>}
        {!loading && !error && (
          <View>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                notifications={notifications}
                onApprove={handleApproveRequest}
                onCancelApproval={handleCancelApproval}
                onDecline={handleDeclineRequest}
                showButton={fetchMode === 'receiving'}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  toggleButton: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 18,
  },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  approvedBox: {
    borderColor: 'green',
    borderWidth: 1,
  },
  expiredBox: {
    backgroundColor: '#f8d7da',
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  phoneNumberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  approveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 5,
  },
  declineButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  returnButton: {
    backgroundColor: '#007bff',  // Blue background for the return button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  expiredText: {
    color: 'red',
  },
});

export default Notification;
