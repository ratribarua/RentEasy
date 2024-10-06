import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Component for individual notification item
const NotificationItem = ({ notification, onApprove, onReject, onCancelApproval, showButton, isExpired }) => {
  const [showInput, setShowInput] = useState(false); // State for showing phone input
  const [phoneNumber, setPhoneNumber] = useState(notification.ownerPhoneNumber || ''); // State for phone number input

  // Handles approving a notification and updates Firebase
  const handleApprove = async () => {
    try {
      if (showInput && phoneNumber.trim() === '') {
        console.error('Please enter a phone number.');
        return;
      }

      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'approved',
        ownerPhoneNumber: phoneNumber.trim(),
      });

      onApprove(notification.id); // Callback to update parent state
      console.log(`Notification sent to sender ${notification.senderId}: "Approved"`);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  // Handles rejecting a notification and updates Firebase
  const handleReject = async () => {
    try {
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'rejected',
        ownerPhoneNumber: ''
      });
      onReject(notification.id); // Callback to update parent state
      console.log(`Notification sent to sender ${notification.senderId}: "Rejected"`);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Cancels an approval and resets status to pending in Firebase
  const handleCancelApproval = async () => {
    try {
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'pending',
        ownerPhoneNumber: ''
      });
      onCancelApproval(notification.id); // Callback to update parent state
      console.log(`Notification sent to sender ${notification.senderId}: "Approval Canceled"`);
    } catch (error) {
      console.error('Error canceling approval:', error);
    }
  };

  const boxStyle = isExpired ? styles.notificationItemExpired : styles.notificationItem; // Style depending on expiry

  return (
    <View style={boxStyle}>
      {/* Displaying basic notification details */}
      <Text style={styles.notificationText}>Sender: {notification.senderName}</Text>
      <Text style={styles.notificationText}>Book Title: {notification.bookTitle}</Text>
      <Text style={styles.notificationText}>Location: {notification.location}</Text>
      {notification.rentDuration && (
        <Text style={styles.notificationText}>Rent Duration: {new Date(notification.rentDuration.seconds * 1000).toLocaleDateString()}</Text>
      )}

      {/* Conditional buttons for approval/rejection */}
      {showButton && notification.status === 'pending' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.approveButton} onPress={() => setShowInput(true)}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input field for phone number after clicking approve */}
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

      {/* Button to cancel approval if already approved */}
      {showButton && notification.status === 'approved' && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelApproval}>
          <Text style={styles.buttonText}>Cancel Approval</Text>
        </TouchableOpacity>
      )}

      {/* Displaying status and phone number for old notifications */}
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

// Main Notification component that handles fetching and displaying notifications
const Notification = ({ route }) => {
  const { userId } = route.params; // User ID passed via navigation route
  const [notifications, setNotifications] = useState([]); // State for notifications list
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [fetchMode, setFetchMode] = useState('receiving'); // Mode to switch between sending and receiving notifications

  // Fetch notifications on component mount and fetchMode/userId change
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch notifications based on fetchMode
        let q;
        if (fetchMode === 'sending') {
          q = query(collection(db, 'notifications'), where('senderId', '==', userId));
        } else {
          q = query(collection(db, 'notifications'), where('ownerId', '==', userId));
        }

        const querySnapshot = await getDocs(q);
        const fetchedNotifications = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const isExpired = data.rentDuration && new Date() > new Date(data.rentDuration.seconds * 1000);

          return {
            id: doc.id,
            senderName: data.senderName,
            senderId: data.senderId,
            ownerPhoneNumber: data.ownerPhoneNumber || '',
            rentDuration: data.rentDuration || '',
            status: data.status,
            isExpired,
            ...data
          };
        });
        setNotifications(fetchedNotifications); // Set notifications state
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, fetchMode]);

  // Toggles between viewing sending and receiving notifications
  const toggleMode = () => {
    setFetchMode(prevMode => (prevMode === 'sending' ? 'receiving' : 'sending'));
  };

  // Update notification status locally after approval
  const handleApproveRequest = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'approved' } : notification
      )
    );
  };

  // Update notification status locally after rejection
  const handleRejectRequest = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'rejected', ownerPhoneNumber: '' } : notification
      )
    );
  };

  // Update notification status locally after canceling approval
  const handleCancelApproval = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'pending', ownerPhoneNumber: '' } : notification
      )
    );
  };

  // Separate new and old notifications
  const newNotifications = notifications.filter(notification => notification.status === 'pending' && !notification.isExpired);
  const oldNotifications = notifications.filter(notification => notification.status !== 'pending' || notification.isExpired);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Toggle between viewing sending and receiving notifications */}
      <View style={styles.section}>
        <TouchableOpacity onPress={toggleMode}>
          <Text style={styles.toggleButton}>{fetchMode === 'sending' ? 'View Receiving Notifications' : 'View Sending Notifications'}</Text>
        </TouchableOpacity>
      </View>

      {/* Display new notifications */}
      <View style={styles.section}>
        <Text style={styles.header}>New Notifications</Text>
        {loading && <Text>Loading...</Text>}
        {error && <Text>Error: {error}</Text>}
        {!loading && !error && (
          <View>
            {newNotifications.length > 0 ? (
              newNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onCancelApproval={handleCancelApproval}
                  showButton={fetchMode === 'receiving'}
                  isExpired={notification.isExpired}
                />
              ))
            ) : (
              <Text>No new notifications</Text>
            )}
          </View>
        )}
      </View>

      {/* Display old notifications */}
      <View style={styles.section}>
        <Text style={styles.header}>Old Notifications</Text>
        {!loading && !error && (
          <View>
            {oldNotifications.length > 0 ? (
              oldNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onCancelApproval={handleCancelApproval}
                  showButton={false} // No actions for old notifications
                  isExpired={notification.isExpired}
                />
              ))
            ) : (
              <Text>No old notifications</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Styles for Notification component and items
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
  notificationItemExpired: {
    borderWidth: 1,
    borderColor: '#ff0000', // Red border for expired notifications
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffe6e6', // Light red background
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    backgroundColor: '#4b0082',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
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
