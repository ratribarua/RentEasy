import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

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
    
        if (showInput && phoneNumber.trim() === '') {
          Alert.alert('Error', 'Please enter a phone number.');
          return;
        }
        
        // Check if the phone number matches the expected format
        if (!phoneRegex.test(phoneNumber)) {
          Alert.alert('Error', 'Please enter a valid 11-digit phone number.');
          return;
        }
    
        await updateDoc(doc(db, 'notifications', notification.id), {
          status: 'approved',
          ownerPhoneNumber: phoneNumber.trim(),
        });
    
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

  const handleDecline = async () => {
    try {
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'request declined',
      });
      onDecline(notification.id);
      Alert.alert('Request Declined', 'The request has been declined.');
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleReturnBook = async () => {
    try {
      // Update the notification to reflect the book has been returned
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'returned',
      });

      // Optional: Send a notification to the owner if necessary
      Alert.alert('Book Returned', 'The book has been successfully returned to the owner.');
    } catch (error) {
      console.error('Error returning book:', error);
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
      {showInput && (
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
      {showButton && notification.status === 'approved' && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelApproval}>
          <Text style={styles.buttonText}>Cancel Approval</Text>
        </TouchableOpacity>
      )}
      {notification.status === 'approved' && isExpired && (
        <TouchableOpacity style={styles.returnButton} onPress={handleReturnBook}>
          <Text style={styles.buttonText}>Return Book</Text>
        </TouchableOpacity>
      )}
      {!showButton && (
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

const Notification = ({ route }) => {
  const { userName, userId } = route.params;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchMode, setFetchMode] = useState('receiving');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!userId) {
          setLoading(false);
          return;
        }

        let q;
        if (fetchMode === 'sending') {
          q = query(collection(db, 'notifications'), where('senderId', '==', userId));
        } else {
          q = query(collection(db, 'notifications'), where('ownerId', '==', userId));
        }

        const querySnapshot = await getDocs(q);
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          senderName: doc.data().senderName,
          senderId: doc.data().senderId,
          ownerPhoneNumber: doc.data().ownerPhoneNumber || '',
          rentDuration: doc.data().rentDuration || '',
          ...doc.data(),
        }));
        setNotifications(fetchedNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, fetchMode]);

  const toggleMode = () => {
    setFetchMode(prevMode => (prevMode === 'sending' ? 'receiving' : 'sending'));
  };

  const handleApproveRequest = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'approved' } : notification
      )
    );
  };

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
