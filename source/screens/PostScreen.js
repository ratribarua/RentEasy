import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList ,ScrollView} from 'react-native';
import { Avatar, Title, Caption, Text as PaperText, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const PostScreen = () => {
  //get user info states
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  //blog states
  const [blogs, setBlogs] = useState([]);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  
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

  const renderBlogItem = ({ item }) => (
    <View style={styles.blogItem}>
      <Text style={styles.blogTitle}>{item.title}</Text>
      <Text style={styles.blogContent}>{item.content}</Text>
      <View style={styles.interactionContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Comments', { blogId: item.id })}>
          <Text>Comments: {item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLike(item.id)}>
          <Text>Likes: {item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDislike(item.id)}>
          <Text>Dislikes: {item.dislikes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
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

      {/* Display user's blogs */}
      <FlatList
        data={blogs}
        keyExtractor={(item) => item.id}
        renderItem={renderBlogItem}
        style={styles.blogList}
      />
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

export default PostScreen;





// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
// import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
// import { auth, db } from './firebaseConfig';

// const PostScreen = ({ navigation }) => {
//   const [blogs, setBlogs] = useState([]);
//   const [newBlogTitle, setNewBlogTitle] = useState('');
//   const [newBlogContent, setNewBlogContent] = useState('');

//   // useEffect(() => {
//   //   const fetchBlogs = async () => {
//   //     try {
//   //       const blogsRef = collection(db, 'blogs');
//   //       const querySnapshot = await getDocs(blogsRef);
//   //       const blogsData = [];

//   //       querySnapshot.forEach((doc) => {
//   //         const blogData = doc.data();
//   //         blogData.id = doc.id;
//   //         blogsData.push(blogData);
//   //       });

//   //       setBlogs(blogsData);
//   //     } catch (error) {
//   //       console.error('Error fetching blogs:', error);
//   //     }
//   //   };

//   //   fetchBlogs();
//   // }, []);

//   const handleAddBlog = async () => {
//     try {
//       if (newBlogTitle.trim().length === 0 || newBlogContent.trim().length === 0) {
//         alert('Please provide both title and content for the blog.');
//         return;
//       }
  
//       const user = auth.currentUser;
  
//       if (!user) {
//         // Handle the case where the user is not authenticated.
//         alert('You need to be logged in to post a blog.');
//         return;
//       }
  
//       const newBlogData = {
//         title: newBlogTitle,
//         content: newBlogContent,
//         comments: [],
//         likes: 0,
//         dislikes: 0,
//         username:userName,
//       };
  
//       const docRef = await addDoc(collection(db, 'blogs'), newBlogData);
//       setBlogs([...blogs, { ...newBlogData, id: docRef.id }]);
//       setNewBlogTitle('');
//       setNewBlogContent('');
//     } catch (error) {
//       console.error('Error adding blog:', error);
//     }
//   };
  
//   const handleLike = async (blogId) => {
//     try {
//       const blogRef = doc(db, 'blogs', blogId);
//       await updateDoc(blogRef, { likes: blogs.find((blog) => blog.id === blogId).likes + 1 });
//     } catch (error) {
//       console.error('Error updating likes:', error);
//     }
//   };

//   const handleDislike = async (blogId) => {
//     try {
//       const blogRef = doc(db, 'blogs', blogId);
//       await updateDoc(blogRef, { dislikes: blogs.find((blog) => blog.id === blogId).dislikes + 1 });
//     } catch (error) {
//       console.error('Error updating dislikes:', error);
//     }
//   };

//   const renderBlogItem = ({ item }) => (
//     <View style={styles.blogItem}>
//       <Text style={styles.blogTitle}>{item.title}</Text>
//       <Text style={styles.blogContent}>{item.content}</Text>
//       <View style={styles.interactionContainer}>
//         <TouchableOpacity onPress={() => navigation.navigate('Comments', { blogId: item.id })}>
//           <Text>Comments: {item.comments.length}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => handleLike(item.id)}>
//           <Text>Likes: {item.likes}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => handleDislike(item.id)}>
//           <Text>Dislikes: {item.dislikes}</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Title of the blog..."
//         value={newBlogTitle}
//         onChangeText={(text) => setNewBlogTitle(text)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Write your blog here..."
//         multiline
//         value={newBlogContent}
//         onChangeText={(text) => setNewBlogContent(text)}
//       />
//       <TouchableOpacity style={styles.addButton} onPress={handleAddBlog}>
//         <Text style={styles.buttonText}>Add Blog</Text>
//       </TouchableOpacity>
//       <FlatList
//         data={blogs}
//         keyExtractor={(item) => item.id}
//         renderItem={renderBlogItem}
//         style={styles.blogList}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   input: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 16,
//     padding: 8,
//   },
//   addButton: {
//     backgroundColor: '#32cd32',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   blogList: {
//     flex: 1,
//   },
//   blogItem: {
//     marginBottom: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//   },
//   blogTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   blogContent: {
//     marginBottom: 8,
//   },
//   interactionContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
// });

// export default PostScreen;
