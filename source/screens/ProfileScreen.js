import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Avatar, Title, Caption, TouchableRipple, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RatingScreen from './RatingScreen'; // Import your RatingScreen component
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const ProfileScreen = () => {
  //get user info states
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  //blog states
  const [blogs, setBlogs] = useState([]);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');

  //rating
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);

   // Open the rating modal
   const openRatingModal = () => {
    setRatingModalVisible(true);
  };

  // Close the rating modal
  const closeRatingModal = () => {
    setRatingModalVisible(false);
  };
  
    // Function to update user data including userName
    const updateUserData = async (newUserName) => {
      try {
        const usersRef = doc(db, 'users', userData.userRef);
        await updateDoc(usersRef, { userName: newUserName });
  
        // Refetch user data after updating userName
        await getUserData();
        // Fetch blogs again to include the updated userName
        await fetchBlogs();
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    };

  //check if log in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        getUserData();
        fetchBlogs();
      } else {
        // No user is signed in, navigate to the login screen or show a message
        Alert('')
        navigation.replace('Login');
        
        // You can replace it with your login screen route
      }
    });

    return () => unsubscribe();
  }, [navigation]);





  //fetching user data
  const getUserData = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const { userName, user_id, email, dp_url, semester } = userData;
        const loggedUserData = {
          userRef: user_id,
          email: email,
          userName: userName,
          userProfilePic: dp_url,
          semester: semester,
        };
        setUserData(loggedUserData);
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUserData();
    fetchBlogs(); // Fetch blogs on component mount

    // Real-time update for blogs
    const unsubscribe = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const blogsData = [];
      snapshot.forEach((doc) => {
        const blogData = doc.data();
        blogData.id = doc.id;
        blogsData.push(blogData);
      });
      setBlogs(blogsData);
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, []);
  
  //fetching blogs of that user
  const fetchBlogs = async () => {
    try {
      const blogsRef = collection(db, 'blogs');
      const querySnapshot = await getDocs(blogsRef);
      const blogsData = [];

      querySnapshot.forEach((doc) => {
        const blogData = doc.data();
        blogData.id = doc.id;
        blogsData.push(blogData);
      });

      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };


  //logout logic
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };


    //post new blog
    const handlePostBlog = async () => {
      try {
        const date = new Date().toISOString();
        const blogData = {
          title: newBlogTitle,
          content: newBlogContent,
          comments: [],
          likes: 0,
          dislikes: 0,
          userId: userData?.userRef,
          userName: userData?.userName,
          date: date,
        };
  
        const blogsRef = collection(db, 'blogs');
        const newBlogDoc = await addDoc(blogsRef, blogData);
  
        console.log('Blog posted successfully!');

            // Reset input text
        setNewBlogTitle('');
        setNewBlogContent('');
  
        // Provide user feedback or navigate back to the profile screen
        Alert.alert('Success', 'Blog posted successfully', [{ text: 'OK', onPress: () => navigation.navigate('Profile') }]);
      } catch (error) {
        console.error('Error posting blog:', error);
        Alert.alert('Error', 'Failed to post blog. Please try again.');
      }
    };
  
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {userData && (
          <View>
            <View style={styles.userInfoSection}>
              <View style={{ flexDirection: 'row', marginTop: 15 }}>
                <Avatar.Image source={{ uri: userData?.userProfilePic }} size={80} />
                <View style={{ marginLeft: 10 }}>
                  <Title style={[styles.title, { marginTop: 15, marginBottom: 5, color:"#00008b" }]}>{userData?.userName}</Title>
                </View>
                {/* Star Icon */}
                {auth.currentUser && (
               <View style={styles.starIconContainer}>
               <IconButton
               icon="star"
              color="#FFD700"
              size={30}
              marginLeft={20}
              onPress={openRatingModal} // Open the rating modal on press
            />
          </View>
        )}
                {/* Rating Modal */}
                <Modal
          animationType="slide"
          transparent={true}
          visible={isRatingModalVisible}
          onRequestClose={closeRatingModal}
        >
          <View style={styles.modalContainer}>
    {userData ? (
      <RatingScreen 
        closeModal={closeRatingModal} 
        userId={userData ? userData.userRef : null}
        userName={userData ? userData.userName : null}
      />
    ) : (
      <Text>Loading user data...</Text> // Provide a loading indicator or handle the case where userData is not available
    )}
  </View>
        </Modal>
              </View>
            </View>
  
            <View style={styles.userInfoSection}>
              <View style={styles.row}>
                <Icon name="book" color="#6495ed" size={25} />
                <Text style={{ marginLeft: 20, color: '#00008b', fontSize: 18 ,backgroundColor:"#dcdcdc"}}>Semester : {userData?.semester}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="email" color="#6495ed" size={25} />
                <Text style={{ marginLeft: 20, color: '#00008b', fontSize: 18 ,backgroundColor:"#dcdcdc"}}>{userData?.email}</Text>
              </View>
            </View>
  
            
            <View>
              <TouchableRipple onPress={() => navigation.navigate('HomePage')}>
                <View style={styles.menuItem}>
                  <Icon name="book-arrow-right" color="#4b0082" size={25} />
                  <Text style={styles.menuItemText}>My Books(to give rent)</Text>
                </View>
              </TouchableRipple>
  
              <TouchableRipple onPress={() => {}}>
                <View style={styles.menuItem}>
                  <Icon name="book-arrow-left-outline" color="#4b0082"  size={25} />
                  <Text style={styles.menuItemText}>Borrowed</Text>
                </View>
              </TouchableRipple>
  
              <TouchableRipple onPress={() => navigation.navigate('ProfileUpdate')}>
                <View style={styles.menuItem}>
                  <Icon name="cog-outline" color="#4b0082"  size={25} />
                  <Text style={styles.menuItemText}>Edit Profile</Text>
                </View>
              </TouchableRipple>
  
              <TouchableRipple onPress={handleLogout}>
                <View style={styles.menuItem}>
                  <Icon name="logout" color="#4b0082" size={25} />
                  <Text style={styles.menuItemText}>Logout</Text>
                </View>
              </TouchableRipple>

              {/* Link to PostScreen */}
              <TouchableOpacity onPress={() => navigation.navigate('PostScreen', { userId: userData?.userRef, userName: userData?.userName })}>
                <View style={styles.menuItem}>
                  <Icon name="pencil" color="#4b0082" size={25} />
                  <Text style={styles.menuItemText}>See Blog</Text>
                </View>
              </TouchableOpacity>

              
  
              {/* Display user's blogs */}
              {auth.currentUser && (
                <View>
                  {/* Blog posting section */}
                  <View style={styles.blogPostSection}>
                    <TextInput
                      style={styles.input}
                      placeholder="Title of the blog..."
                      value={newBlogTitle}
                      onChangeText={(text) => setNewBlogTitle(text)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Write your blog here..."
                      multiline
                      value={newBlogContent}
                      onChangeText={(text) => setNewBlogContent(text)}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handlePostBlog}>
                      <Text style={styles.buttonText}>Add Blog</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
  
        {!userData && (
          <View style={styles.loginMessageContainer}>
            <Text style={styles.loginMessageText}>
              Please log in to access your profile
            </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLinkText}>Log In</Text>
            </TouchableOpacity>
          </View>
        )}

        
      </ScrollView>
    </SafeAreaView>
  );
  
            
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  blogPostSection: {
    padding: 16,
  },
  title: {
    fontSize: 29,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 15,
    lineHeight: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  blogList: {
    flex: 1,
  },
  blogItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  blogContent: {
    marginBottom: 8,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
  },
  addButton: {
    backgroundColor: '#32cd32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
 
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  menuItemText: {
    color: '#777777',
    marginLeft: 20,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 26,
  },
  loginMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loginMessageText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginLinkText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  starIconContainer: {
    position: 'absolute',
    //top: 1,
    right: 10,
    //zIndex: 1,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
 
  ratingIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default ProfileScreen;
