import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Avatar, Title} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const DrawerList = [
  {icon: 'home-outline', label: 'Welcome Home', navigateTo: 'WelcomePage'},
  {icon: 'login', label: 'Login', navigateTo: 'Login'},
  {icon: 'open-in-new', label: 'Signup', navigateTo: 'Signup'},
  {icon: 'account-circle', label: 'Profile', navigateTo: 'ProfileScreen'},
 
];
const DrawerLayout = ({icon, label, navigateTo}) => {
  const navigation = useNavigation();
  // console.log(userData);
  return (
    <DrawerItem
      icon={({color, size}) => <Icon name={icon} color={'#4b0082'} size={35} />}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}
    />
  );
};

const DrawerItems = (props) => {
    return DrawerList.map((el, i) => {
      return (
        <DrawerLayout
          key={i}
          icon={el.icon}
          label={el.label}
          navigateTo={el.navigateTo}
        />
      );
    });
  };
function DrawerContent(props) {
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>     
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}
export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 100,
  },
  title: {
    fontSize: 1,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 20,
    lineHeight: 14,
    // color: '#6e6e6e',
    width: '100%',
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: 15,
  },
  
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

/*<View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({color, size}) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          onPress={() => {
          navigation.navigate(WelcomePage);
      }}
        />
      </View>*/