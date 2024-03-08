import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList ,ScrollView} from 'react-native';
import { Avatar, Title, Caption, Text as PaperText, TouchableRipple,IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, addDoc,doc, updateDoc,onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const ProfileScreen = () => {
  //get user info states
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  //blog states
  const [blogs, setBlogs] = useState([]);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newComment, setNewComment] = useState('');

  
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
      await addDoc(blogsRef, blogData);

      // You may want to provide user feedback here (e.g., show a success message)
      console.log('Blog posted successfully!');

      // Refetch blogs to update the list
      fetchBlogs();
    } catch (error) {
      console.error('Error posting blog:', error);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      await updateDoc(blogRef, { likes: blogs.find((blog) => blog.id === blogId)?.likes + 1 });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDislike = async (blogId) => {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      await updateDoc(blogRef, { dislikes: blogs.find((blog) => blog.id === blogId)?.dislikes + 1 });
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };


  const handleAddComment = async (blogId, newComment) => {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      await updateDoc(blogRef, { comments: [...blogs.find((blog) => blog.id === blogId)?.comments, newComment] });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderBlogItem = ({ item }) => (
    <View style={styles.blogItem}>
      <Text style={styles.blogTitle}>{item.title}</Text>
      <Text style={styles.blogContent}>{item.content}</Text>
      <View style={styles.interactionContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Comments', { blogId: item.id })}>
          <Text>Comments: {item.comments}</Text>
        </TouchableOpacity>

         {/* Real-time Like and Dislike counts */}
      <Text>Likes: {item.likes}</Text>
      <Text>Dislikes: {item.dislikes}</Text>

        {/* Like button */}
      <IconButton
        icon="thumb-up-outline"
        color="#777777"
        size={20}
        onPress={() => handleLike(item.id)}
      />
      
      {/* Dislike button */}
      <IconButton
        icon="thumb-down-outline"
        color="#777777"
        size={20}
        onPress={() => handleDislike(item.id)}
      />
    </View>
       
      {/* Comment section */}
      <View style={styles.commentSection}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={(text) => setNewComment(text)}
        />
        <TouchableOpacity onPress={() => handleAddComment(item.id, newComment)}>
          <Text style={styles.commentButton}>Comment</Text>
        </TouchableOpacity>
        <FlatList
          data={item.comments}
          keyExtractor={(comment) => comment}
          renderItem={({ item: comment }) => (
            <View style={styles.commentContainer}>
              <Text style={styles.commentText}>{comment}</Text>
              {/* Additional styling can be applied here */}
            </View>
          )}
        />
      </View>
    </View>
  );

  
  

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      <View style={styles.userInfoSection}>
        <View style={{ flexDirection: 'row', marginTop: 15 }}>
          <Avatar.Image source={{ uri: userData?.userProfilePic }} size={80} />
          <View style={{ marginLeft: 20 }}>
            <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>{userData?.userName}</Title>
            <Caption style={styles.caption}>@{userData?.userName}</Caption>
          </View>
        </View>
      </View>

      <View style={styles.userInfoSection}>
        <View style={styles.row}>
          <Icon name="account" color="#777777" size={20} />
          <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.userName}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="book" color="#777777" size={20} />
          <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.semester}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="email" color="#777777" size={20} />
          <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.email}</Text>
        </View>
      </View>

      <View style={[styles.infoBox]}>
        <Title>Additional Information</Title>
        {/* Display additional information */}
      </View>

      <View style={styles.menuWrapper}>
        {/* Existing menu items */}
        <TouchableRipple onPress={() => navigation.navigate('HomePage')}>
          <View style={styles.menuItem}>
            <Icon name="book-arrow-right" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>My Books(to give rent)</Text>
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={() => {}}>
          <View style={styles.menuItem}>
            <Icon name="book-arrow-left-outline" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Borrowed</Text>
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={() => navigation.navigate('ProfileUpdate')}>
          <View style={styles.menuItem}>
            <Icon name="cog-outline" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={handleLogout}>
          <View style={styles.menuItem}>
            <Icon name="logout" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Logout</Text>
          </View>
        </TouchableRipple>

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

            <FlatList data={blogs} keyExtractor={(item) => item.id} renderItem={renderBlogItem} style={styles.blogList} />
          </View>
        )}
      </View>
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 50,
    color: '#dddddd',
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

export default ProfileScreen;






























// import { StyleSheet,SafeAreaView, View, TouchableOpacity } from 'react-native'

// import {
//   Avatar,
//   Title,
//   Caption,
//   Text,
//   TouchableRipple,
// } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// import React, { useState, useEffect } from 'react';
// import {useNavigation} from '@react-navigation/native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { auth, db, signOut,firestore} from './firebaseConfig';
// //import { signOut } from 'firebase/auth'; 



// const ProfileScreen = (props) => {
//   const [userData, setUserData] = useState(null);
//   const navigation = useNavigation();
//   const [imageUri, setImageUri] = useState(null);

//   const getUserData = async() =>{
//     try {
//       const usersRef = collection(db, "users");
//       const q = query(usersRef, where("email", "==", auth.currentUser.email));
//       const querySnapshot = await getDocs(q);
//       querySnapshot.forEach((doc) => {
//         const userData = doc.data();
//         const { userName, user_id, email,dp_url, semester } = userData;
//         const loggedUserData = {
//           userRef: user_id,
//           email: email,
//           userName: userName,
//           userProfilePic: dp_url,
//           semester : semester
//         }
//         setUserData(loggedUserData);
//         // Set the imageUri here
//         setImageUri(dp_url);
//       })
//     }
//     catch (e) {
//       console.log(e);
//     }
//   }
  

//   useEffect(() => {
//     getUserData();
//   }, []);
  

//   const handleLogout = () => {
//     auth.signOut().then(() => {
//       console.log('doing');
//       navigation.replace('Login');
//     }).catch(error => {
//       console.error('Error signing out:', error);
//     });
//   };
  


//   return (
//     <SafeAreaView style={styles.container}>
//     <View style={styles.userInfoSection}>
//       <View style={{ flexDirection: 'row', marginTop: 15 }}>
//         <Avatar.Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/renteasyproject.appspot.com/o/Avatar.png?'}} size={80} />
//         <View style={{ marginLeft: 20 }}>
//           <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>{userData?.userName}</Title>
//           <Caption style={styles.caption}>@{userData?.userName}</Caption>
//         </View>
//       </View>
//     </View>

//     <View style={styles.userInfoSection}>
//       <View style={styles.row}>
//         <Icon name="account" color="#777777" size={20} />
//         <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.userName}</Text>
//       </View>
//       <View style={styles.row}>
//         <Icon name="book" color="#777777" size={20} />
//         <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.semester}</Text>
//       </View>
//       <View style={styles.row}>
//         <Icon name="email" color="#777777" size={20} />
//         <Text style={{ marginLeft: 20, color: '#777777', fontSize: 16 }}>{userData?.email}</Text>
//       </View>
//     </View>

//       <View style={[styles.infoBox]}>
//         <Title>Additional Information</Title>
//         {/* Display additional information */}
//       </View>

//       <View style={styles.menuWrapper}>
//         <TouchableRipple onPress={() => props.navigation.navigate('HomePage')}>
//           <View style={styles.menuItem}>
//             <Icon name="book-arrow-right" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>My Books(to give rent)</Text>
//           </View>
//         </TouchableRipple>

//         <TouchableRipple onPress={() => {}}>
//           <View style={styles.menuItem}>
//             <Icon name="book-arrow-left-outline" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>Borrowed</Text>
//           </View>
//         </TouchableRipple>

//         <TouchableRipple onPress={() => props.navigation.navigate('ProfileUpdate')}>
//           <View style={styles.menuItem}>
//             <Icon name="cog-outline" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>Edit Profile</Text>
//           </View>
//         </TouchableRipple>
//       </View>

//       <View style={styles.menuWrapper}>
//         <TouchableRipple onPress={handleLogout}>
//           <View style={styles.menuItem}>
//             <Icon name="logout" color="#FF6347" size={25} />
//             <Text style={styles.menuItemText}>Logout</Text>
//           </View>
//         </TouchableRipple>
//       </View>

//     </SafeAreaView>
//   );
// };

// export default ProfileScreen

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   userInfoSection: {
//     paddingHorizontal: 30,
//     marginBottom: 25,
//   },
//   title: {
//     fontSize: 29,
//     fontWeight: 'bold',
//   },
//   caption: {
//     fontSize: 15,
//     lineHeight: 14,
//     fontWeight: '500',
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   infoBoxWrapper: {
//     borderBottomColor: '#dddddd',
//     borderBottomWidth: 1,
//     borderTopColor: '#dddddd',
//     borderTopWidth: 1,
//     flexDirection: 'row',
//     height: 50,
//     alignContent: 'center',
//   },
//   infoBox: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontWeight: 'bold',
//     fontSize: 50,
//     color: '#dddddd',
//   },
//   menuWrapper: {
//     marginTop: 10,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//   },
//   menuItemText: {
//     color: '#777777',
//     marginLeft: 20,
//     fontWeight: '600',
//     fontSize: 16,
//     lineHeight: 26,
//   },
// });
