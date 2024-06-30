import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const NotificationItem = ({ notification, onApprove, onCancelApproval, showButton }) => {
  const [showInput, setShowInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(notification.ownerPhoneNumber || ''); // Initialize with ownerPhoneNumber if available

  const handleApprove = async () => {
    try {
      if (showInput && phoneNumber.trim() === '') {
        console.error('Please enter a phone number.');
        return;
      }

      // Update the status of the notification to "approved" in Firestore
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'approved',
        ownerPhoneNumber: phoneNumber.trim(), // Store the owner's phone number
      });

      // Fetch other notifications for the same book
      const otherNotifications = notifications.filter(otherNotification => otherNotification.id !== notification.id && otherNotification.bookId === notification.bookId);

      // Update the status of other notifications to 'Book is not available'
      for (const otherNotification of otherNotifications) {
        await updateDoc(doc(db, 'notifications', otherNotification.id), {
          status: 'Book is not available'
        });
      }

      // Perform action with phone number, e.g., send SMS
      console.log('Phone number:', phoneNumber);

      // Invoke the callback function passed from the parent component
      onApprove(notification.id);
      
      console.log(`Notification sent to sender ${notification.senderId}: "Approved"`);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleCancelApproval = async () => {
    try {
      // Update the status of the notification to "pending" in Firestore
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'pending',
        ownerPhoneNumber: '' // Clear owner's phone number when canceling approval
      });
      // Invoke the callback function passed from the parent component
      onCancelApproval(notification.id);
      
      console.log(`Notification sent to sender ${notification.senderId}: "Approval Canceled"`);
    } catch (error) {
      console.error('Error canceling approval:', error);
    }
  };

  return (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>Sender: {notification.senderName}</Text>
      <Text style={styles.notificationText}>Book Title: {notification.bookTitle}</Text>
      <Text style={styles.notificationText}>Location: {notification.location}</Text>
      {notification.rentDuration && (
        <Text style={styles.notificationText}>Rent Duration: {new Date(notification.rentDuration.seconds * 1000).toLocaleDateString()}</Text>
      )}

      {showButton && notification.status === 'pending' && (
        <TouchableOpacity style={styles.approveButton} onPress={() => setShowInput(true)}>
          <Text style={styles.buttonText}>Approve Request</Text>
        </TouchableOpacity>
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
      {!showButton && (
        <View>
          <Text style={styles.notificationText}>Status: {notification.status}</Text>
          {notification.ownerPhoneNumber && (
            <Text style={styles.notificationText}>Phone Number: {notification.ownerPhoneNumber}</Text>
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
  const [fetchMode, setFetchMode] = useState('receiving'); // Default mode is 'receiving'

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!userId) {
          setLoading(false);
          return;
        }

        let q;
        if (fetchMode === 'sending') {
          // Fetch notifications where senderId is equal to userId
          q = query(collection(db, 'notifications'), where('senderId', '==', userId));
        } else {
          // Fetch notifications where ownerId is equal to userId
          q = query(collection(db, 'notifications'), where('ownerId', '==', userId));
        }
        
        const querySnapshot = await getDocs(q);
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          senderName: doc.data().senderName,
          senderId: doc.data().senderId,
          ownerPhoneNumber: doc.data().ownerPhoneNumber || '', // Initialize ownerPhoneNumber
          rentDuration: doc.data().rentDuration || '', // Fetch rent duration
          ...doc.data()
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
  }, [userId, fetchMode]); // Include fetchMode as dependency

  const toggleMode = () => {
    // Toggle between 'sending' and 'receiving' modes
    setFetchMode(prevMode => (prevMode === 'sending' ? 'receiving' : 'sending'));
  };

  const handleApproveRequest = async (notificationId) => {
    try {
      // Update the local state to reflect the approved request
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, status: 'approved' } : notification
        )
      );
  
      // Fetch other notifications for the same book
      const otherNotifications = notifications.filter(otherNotification => otherNotification.id !== notificationId && otherNotification.bookId === notifications.find(notification => notification.id === notificationId).bookId);
  
      // Update the status of other notifications to 'Book is not available'
      for (const otherNotification of otherNotifications) {
        await updateDoc(doc(db, 'notifications', otherNotification.id), {
          status: 'Book is not available'
        });
      }
  
      console.log(`Status updated for other users who requested the same book`);
    } catch (error) {
      console.error('Error updating status for other users:', error);
    }
  };
  
  const handleCancelApproval = (notificationId) => {
    // Update the local state to reflect the canceled approval
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'pending', ownerPhoneNumber: '' } : notification
      )
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity onPress={toggleMode}>
          <Text style={styles.toggleButton}>{fetchMode === 'sending' ? 'View Receiving Notifications' : 'View Sending Notifications'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>{fetchMode === 'sending' ? 'Sending Notifications' : 'Receiving Notifications'}</Text>
        {loading && <Text>Loading...</Text>}
        {error && <Text>Error: {error}</Text>}
        {!loading && !error && (
          <View>
            <View>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onApprove={handleApproveRequest}
                  onCancelApproval={handleCancelApproval}
                  showButton={fetchMode === 'receiving'} // Show buttons only for receiving notifications
                />
              ))}
            </View>
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
    fontSize: 20,
  },
  notificationItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 18,
  },
  phoneNumberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  approveButton: {
    backgroundColor: '#4b0082',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#ff6347',
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
});

export default Notification;
