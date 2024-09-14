// App.js
import React from 'react';
import { NavigationContainer, useNavigation, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApolloProvider } from '@apollo/client';
import client from './source/screens/apolloClient';

import Signup from './source/screens/Signup';
import Login from './source/screens/Login';
import WelcomePage from './source/screens/WelcomePage';
import DrawerContent from './source/screens/DrawerContent';
import RatingScreen from './source/screens/RatingScreen';
import ProfileScreen from './source/screens/ProfileScreen';
import ProfileUpdate from './source/screens/ProfileUpdate';
import SearchScreen from './source/screens/SearchScreen';
import VideoPlaying from './source/screens/VideoPlaying';
import BlogScreen from './source/screens/BlogScreen';
import Gmaps from './source/screens/Gmaps';
import AddBooks from './source/screens/AddBooks';
import ViewAllBooks from './source/screens/ViewAllBooks';
import ViewCart from './source/screens/ViewCart';
import MyBooks from './source/screens/MyBooks';
import Notification from './source/screens/Notification';
import RentOptionsModal from './source/screens/RentOptionsModal';
import CameraSearch from './source/screens/CameraSearch';

const StackNav = () => {
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation();
  return (
    <Stack.Navigator initialRouteName='WelcomePage'
      screenOptions={{
        statusBarColor: 'white',
        headerStyle: {
          backgroundColor: '#00bfff',
        },
        headerTintColor: '#00bfff',
        headerTitleAlign: 'center',
        headerLeft: () => {
          return (
            <Icon
              name="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              size={30}
              color="#fff"
            />
          );
        },
        headerRight: () => (
          <React.Fragment>
            <Icon
              name="map-marker"
              onPress={() => {
                navigation.navigate('Gmaps');
              }}
              size={30}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Icon
              name="account-circle"
              onPress={() => {
                navigation.navigate('ProfileScreen');
              }}
              size={35}
              color="#fff"
              style={{ marginRight: 10 }}
            />
          </React.Fragment>
        ),
      }}
    >
      <Stack.Screen name="WelcomePage" component={WelcomePage} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="RatingScreen" component={RatingScreen} />
      <Stack.Screen name="ProfileUpdate" component={ProfileUpdate} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="VideoPlaying" component={VideoPlaying} />
      <Stack.Screen name="BlogScreen" component={BlogScreen} />
      <Stack.Screen name="Gmaps" component={Gmaps} />
      <Stack.Screen name="AddBooks" component={AddBooks} />
      <Stack.Screen name="ViewAllBooks" component={ViewAllBooks} />
      <Stack.Screen name="ViewCart" component={ViewCart} />
      
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="RentOptionsModal" component={RentOptionsModal} />
      <Stack.Screen name="CameraSearch" component={CameraSearch} />
    </Stack.Navigator>
  )
}

const DrawerNav = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Drawer.Screen name='Welcome' component={StackNav} />
    </Drawer.Navigator>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <DrawerNav />
      </NavigationContainer>
    </ApolloProvider>
  );
}

export default App;
