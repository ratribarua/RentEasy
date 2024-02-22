import { StyleSheet,SafeAreaView, View, TouchableOpacity } from 'react-native'
import React from 'react'
import {
  Avatar,
  Title,
  Caption,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Profile = (props) => {
  return (
    <SafeAreaView style = {styles.container}>
      <View style={styles.userInfoSection}>
      <View style={{flexDirection: 'row', marginTop: 15}}>
        <Avatar.Image 
            source={{
              uri: 'https://api.adorable.io/avatars/80/abott@adorable.png',
            }}
            size={80}
          />
          <View style={{marginLeft: 20}}>
            <Title style={[styles.title, {
              marginTop:15,
              marginBottom: 5,
            }]}>Ratri</Title>
            <Caption style={styles.caption}>@Ratri</Caption>
          </View>
        </View>
      </View>
      
      <View style={styles.userInfoSection}>
        <View style={styles.row}>
          <Icon name="map-marker-radius" color="#777777" size={20}/>
          <Text style={{color:"#777777", marginLeft: 20}}>Chittagong, Bangladesh</Text>
        </View>
        <View style={styles.row}>
          <Icon name="phone" color="#777777" size={20}/>
          <Text style={{color:"#777777", marginLeft: 20}}>01819876522</Text>
        </View>
        <View style={styles.row}>
          <Icon name="email" color="#777777" size={20}/>
          <Text style={{color:"#777777", marginLeft: 20}}>Ratri@gmail.com</Text>
        </View>
      </View>

      <View style={styles.infoBoxWrapper}>
          <View style={[styles.infoBox]}>
            <Title>Details</Title>
          </View>
      </View>

      <View style={styles.menuWrapper}>
        <TouchableRipple onPress={() => props.navigation.navigate("HomePage")}>
          <View style={styles.menuItem}>
            <Icon name="book-arrow-right" color="#FF6347" size={25}/>
            <Text style={styles.menuItemText}>My Books(to give rent)</Text>
          </View>
        </TouchableRipple>
        
        <TouchableRipple onPress={() => {}}>
          <View style={styles.menuItem}>
            <Icon name="book-arrow-left-outline" color="#FF6347" size={25}/>
            <Text style={styles.menuItemText}>Borrowed</Text>
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={() => props.navigation.navigate("Edit")}>
          <View style={styles.menuItem}>
            <Icon name="cog-outline" color="#FF6347" size={25}/>
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
        </TouchableRipple>
        
      </View>

    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoBoxWrapper: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 50,
    alignContent: 'center',
  },
  infoBox: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuWrapper: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  menuItemText: {
    color: '#777777',
    marginLeft: 20,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 26,
  },
});