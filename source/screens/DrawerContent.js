import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Data for drawer menu items
const DrawerList = [
  { icon: 'home-outline', label: 'Welcome Home', navigateTo: 'WelcomePage' },
  { icon: 'login', label: 'Login', navigateTo: 'Login' },
  { icon: 'open-in-new', label: 'Signup', navigateTo: 'Signup' },
  { icon: 'emoticon-excited-outline', label: 'Know Me', navigateTo: 'VideoPlaying' },
];

// Component for each drawer item
const DrawerItemComponent = ({ icon, label, navigateTo }) => {
  const navigation = useNavigation();
  
  return (
    <DrawerItem
      icon={({ color, size }) => <Icon name={icon} color={'#4b0082'} size={35} />}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}
    />
  );
};

// Component to render all drawer items
const DrawerItems = () => {
  return DrawerList.map((item, index) => (
    <DrawerItemComponent
      key={index}
      icon={item.icon}
      label={item.label}
      navigateTo={item.navigateTo}
    />
  ));
};

// Main DrawerContent component
const DrawerContent = (props) => {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <DrawerItems />
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    marginTop: 15,
    borderBottomWidth: 10,
    borderBottomColor: '#dedede',
    fontSize:180,
  },
});

export default DrawerContent;
