import {View, Text} from 'react-native';
import React from 'react';
import {AirbnbRating, Rating} from 'react-native-ratings';

export default function RatingScreen() {
  return (
    <View>
      <Text
        style={{
          fontSize: 28,
          color: 'black',
          textAlign: 'center',
          marginVertical: 20,
        }}>
        Do you like this app?
      </Text>
      

      <Rating 
      type='star' // heart, star, bell, rocket
        ratingCount={5}
        showRating={true}
        ratingTextColor="red"
        fractions={1} // 0-20
        jumpValue={0.5}
        startingValue={5}
        onStartRating={rating => console.log(`Inital: ${rating}`)}
        onFinishRating={rating => console.log(`Rating finished ${rating}`)}
        onSwipeRating={rating => console.log(`Swiping: ${rating}`)}
      />
    </View>
  );
}