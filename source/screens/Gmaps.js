import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const Gmaps = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weather, setWeather] = useState(null);
  const API_KEY = 'c36335e3a84d4bba03a1d34aa0395523';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Fetch weather data after getting location
      fetchWeather(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      {location && weather ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
      {errorMsg && <Text>{errorMsg}</Text>}
      {weather && (
  <View style={styles.weatherContainer}>
    <Text style={styles.weatherText}>Weather: {weather.weather[0].main}</Text>
    <Text style={styles.weatherText}>Description: {weather.weather[0].description}</Text>
    <Text style={styles.weatherText}>Temperature: {weather.main.temp}°C</Text>
  </View>
)}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  weatherContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: '#00bfff',
    padding: 20,
    borderRadius: 10,
  },
  weatherText: {
    fontSize: 20,
    color: '#ffffff',
  },
});


export default Gmaps;
