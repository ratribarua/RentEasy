import * as React from 'react';
import { NavigationContainer , useNavigation, DrawerActions} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Entypo';
import {createDrawerNavigator} from '@react-navigation/drawer';

import Login from './source/screens/Login';
import WelcomePage from './source/screens/WelcomePage';
import HomePage from './source/screens/HomePage';
import Signup from './source/screens/Signup';

import DrawerContent from './source/screens/DrawerContent';
import EditProfileScreen from './source/screens/EditProfileScreen';
import RatingScreen from './source/screens/RatingScreen';
import ProfileScreen from './source/screens/ProfileScreen';
import PostScreen from './source/screens/PostScreen';




///import AddPostScreen from './source/screens/AddPostScreen';




const StackNav =() =>{
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation();
  return(
    <Stack.Navigator initialRouteName='WelcomePage'
    screenOptions={{
      //statusBarColor: '#0163d2',
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
    }} >
      <Stack.Screen name="WelcomePage" component={WelcomePage} />
      <Stack.Screen name="HomePage" component={HomePage} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Edit" component={EditProfileScreen} />
      <Stack.Screen name="RatingScreen" component={RatingScreen} />
      <Stack.Screen name="PostScreen" component={PostScreen} />
      
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
//screenOptions={{headerShown: false}
//<Stack.Screen name="AddPostScreen" component={AddPostScreen} />