import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Rating } from 'react-native-ratings';
import { addDoc, collection, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

// RatingScreen component allows users to give a rating and handles new ratings or updates to existing ratings.
const RatingScreen = ({ closeModal, userId, userName }) => {
  // State to keep track of the current rating selected by the user
  const [currentRating, setCurrentRating] = useState(0);

  // Function to handle rating submission or updating the existing rating
  const handleRating = async () => {
    try {
      // Check if userId and userName are available before proceeding
      if (userId && userName) {
        // Get the 'ratings' collection from Firestore
        const existingRatingQuery = collection(db, 'ratings');
        const existingRatingSnapshot = await getDocs(existingRatingQuery);
  
        let ratingExists = false;
        let ratingId = '';
  
        // Check if the user has already submitted a rating
        existingRatingSnapshot.forEach(doc => {
          if (doc.data().userId === userId) {
            // If the user has rated before, save the document ID for updating
            ratingExists = true;
            ratingId = doc.id;
          }
        });

        console.log(`Rating exists: ${ratingExists}, Rating ID: ${ratingId}`);
  
        if (ratingExists) {
          // Update the existing rating document with the new rating
          console.log(`Updating rating to ${currentRating} for user ${userId}`);
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
          // Add a new rating document if the user hasn't rated before
          console.log(`Submitting new rating of ${currentRating} for user ${userId}`);
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
        // Log an error if userId or userName is missing
        console.error('userId or userName is not available');
        Alert.alert('Error', 'Failed to submit rating. User ID or user name is not available.');
      }
    } catch (error) {
      // Log any errors that occur during submission or update
      console.error('Error submitting/updating rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Give Rating</Text>

      {/* Rating component from 'react-native-ratings' */}
      <Rating
        type='star'
        ratingCount={5}
        showRating={true}
        fractions={1}
        startingValue={0}
        onFinishRating={(rating) => {
          setCurrentRating(rating); // Update state with the selected rating
          console.log(`User selected rating: ${rating}`); // Log the selected rating
        }}
      />

      {/* Button to submit the rating */}
      <Button title="Submit" onPress={handleRating} />
    </View>
  );
};

// Styles for the RatingScreen component
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
