import * as React from 'react';
import { NavigationContainer , useNavigation, DrawerActions} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import Icon from 'react-native-vector-icons/Entypo';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Login from './source/screens/Login';
import WelcomePage from './source/screens/WelcomePage';
import MyBooks from './source/screens/MyBooks';
import Signup from './source/screens/Signup';

import DrawerContent from './source/screens/DrawerContent';
import RatingScreen from './source/screens/RatingScreen';
import ProfileScreen from './source/screens/ProfileScreen';
import PostScreen from './source/screens/PostScreen';
import ProfileUpdate from './source/screens/ProfileUpdate';
import SearchScreen from './source/screens/SearchScreen';






const StackNav =() =>{
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation();
  return(
    <Stack.Navigator initialRouteName='WelcomePage'
    screenOptions={{
      statusBarColor: 'white',
      headerStyle: {
        backgroundColor: '#00bfff',
      },
      headerTintColor: '#00bfff',
      headerTitleAlign: 'center',
      headerLeft: ()=> {
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
              name="magnify"
              onPress={() => {
                navigation.navigate('SearchScreen');
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
      <Stack.Screen name="MyBooks" component={MyBooks} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="RatingScreen" component={RatingScreen} />
      <Stack.Screen name="PostScreen" component={PostScreen} />
      <Stack.Screen name="ProfileUpdate" component={ProfileUpdate} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
    </Stack.Navigator>
  )
}

const DrawerNav =() => {
  const Drawer = createDrawerNavigator();
  return (
      <Drawer.Navigator 
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
        <Drawer.Screen name = 'Welcome' component ={StackNav}/>
      </Drawer.Navigator>
  );
};

function App() {
  return (
    <NavigationContainer>
       <DrawerNav/>
    </NavigationContainer>
  );
}

export default App;
