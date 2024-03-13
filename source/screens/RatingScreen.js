import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Rating } from 'react-native-ratings';
import { addDoc, collection,updateDoc, doc, query, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const RatingScreen = ({ closeModal ,userId, userName}) => {
  const [currentRating, setCurrentRating] = useState(0);

  const handleRating = async () => {
    try {
      if (userId && userName) {
        const existingRatingQuery = collection(db, 'ratings');
        const existingRatingSnapshot = await getDocs(existingRatingQuery);
  
        let ratingExists = false;
        let ratingId = '';
  
        existingRatingSnapshot.forEach(doc => {
          if (doc.data().userId === userId) {
            // User has already rated, update the existing rating
            ratingExists = true;
            ratingId = doc.id;
          }
        });
  
        if (ratingExists) {
          // Update the existing rating
          await updateDoc(doc(db, 'ratings', ratingId), {
            rating: currentRating,
            timestamp: new Date(),
          });
  
          Alert.alert(
            'Rating Updated!',
            `Your rating has been updated to ${currentRating}`,
            [{ text: 'OK', onPress: () => closeModal() }]
          );
        } else {
          // Add a new rating
          await addDoc(collection(db, 'ratings'), {
            userId: userId,
            userName: userName,
            rating: currentRating,
            timestamp: new Date(),
          });
  
          Alert.alert(
            'Rating Submitted!',
            `Thank you for rating the app with ${currentRating}`,
            [{ text: 'OK', onPress: () => closeModal() }]
          );
        }
      } else {
        console.error('userId or userName is not available');
        Alert.alert('Error', 'Failed to submit rating. User ID or user name is not available.');
      }
    } catch (error) {
      console.error('Error submitting/updating rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Give Rating</Text>

      <Rating
        type='star'
        ratingCount={5}
        showRating={true}
        fractions={1}
        startingValue={0}
        onFinishRating={(rating) => setCurrentRating(rating)}
      />

      <Button title="Submit" onPress={handleRating} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default RatingScreen;