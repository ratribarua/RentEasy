import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert,Image } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const PostScreen = ({ navigation, route }) => {
  const { userId, userName } = route.params;
  const [user, setUser] = useState(null); // User state to store the authenticated user
  const [blogs, setBlogs] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Check if a user is logged in
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        // If user is not logged in, navigate to the login screen
        navigation.navigate('Login'); // Replace 'Login' with the name of your login screen
      }
    });

    // Real-time update for blogs
    const unsubscribeBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const blogsData = [];
      snapshot.forEach((doc) => {
        const blogData = doc.data();
        blogData.id = doc.id;
        blogsData.push(blogData);
      });
      setBlogs(blogsData);
    });

    // Cleanup the listeners when the component is unmounted
    return () => {
      unsubscribeAuth();
      unsubscribeBlogs();
    };
  }, [navigation]);

  //const { userId, userName } = route.params;

  const handleLikeDislike = async (blogId, reactionType) => {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      const currentBlogIndex = blogs.findIndex((blog) => blog.id === blogId);
      const currentBlog = blogs[currentBlogIndex];

      if (!currentBlog.userReacted) {
        // User has not reacted yet
        const newReactionCount = currentBlog[reactionType] + 1;
        await updateDoc(blogRef, {
          [reactionType]: newReactionCount,
          userReacted: reactionType,
        });

        setBlogs((prevBlogs) => {
          const updatedBlogs = [...prevBlogs];
          updatedBlogs[currentBlogIndex] = {
            ...currentBlog,
            [reactionType]: newReactionCount,
            userReacted: reactionType,
          };
          return updatedBlogs;
        });
      } else if (currentBlog.userReacted === reactionType) {
        // User is toggling the reaction
        const newReactionCount = currentBlog[reactionType] - 1;
        await updateDoc(blogRef, {
          [reactionType]: newReactionCount,
          userReacted: null,
        });

        setBlogs((prevBlogs) => {
          const updatedBlogs = [...prevBlogs];
          updatedBlogs[currentBlogIndex] = {
            ...currentBlog,
            [reactionType]: newReactionCount,
            userReacted: null,
          };
          return updatedBlogs;
        });
      } else {
        // User is changing reaction
        const newReactionCount = currentBlog[reactionType] + 1;
        const oldReactionCount = currentBlog[currentBlog.userReacted] - 1;
        await updateDoc(blogRef, {
          [reactionType]: newReactionCount,
          [currentBlog.userReacted]: oldReactionCount,
          userReacted: reactionType,
        });

        setBlogs((prevBlogs) => {
          const updatedBlogs = [...prevBlogs];
          updatedBlogs[currentBlogIndex] = {
            ...currentBlog,
            [reactionType]: newReactionCount,
            [currentBlog.userReacted]: oldReactionCount,
            userReacted: reactionType,
          };
          return updatedBlogs;
        });
      }
    } catch (error) {
      console.error(`Error updating ${reactionType}:`, error);
    }
  };

  const handleAddComment = async (blogId,userName, userId) => {
    try {
      if (newComment.trim() !== '') {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
          comments: [
            ...(blogs.find((blog) => blog.id === blogId)?.comments || []),
            { userName: userName, userId: userId, text: newComment }, // Include the userName in the comment
          ],
        });

        // Clear the comment input after successfully adding a comment
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

// Function to delete a blog
const handleDeleteBlog = async (blogId) => {
  try {
    // Show confirmation dialog
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this blog?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const blogRef = doc(db, 'blogs', blogId);
            await deleteDoc(blogRef);

            // Remove the deleted blog from the state
            setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));

            Alert.alert('Success', 'Blog deleted successfully!');
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  } catch (error) {
    console.error('Error deleting blog:', error);
    Alert.alert('Error', 'Failed to delete blog. Please try again.');
  }
};


  const renderBlogItem = ({ item }) => (
    <View style={styles.blogItem}>
      <Text style={styles.userNameText}>{item.userName}'s Blog</Text>
      <Text style={styles.blogTitle}>{item.title}</Text>
      <Text style={styles.blogContent}>{item.content}</Text>
          {/* Display the picture */}
    {item.imageURL && (
      <Image source={{ uri: item.imageURL }} style={styles.blogImage} />
    )}
      <View style={styles.interactionContainer}>
        <Text>Comments: {item.comments.length}</Text>

       {/* Like and dislike icons */}
    <View>
      <TouchableOpacity onPress={() => handleLikeDislike(item.id, 'likes')}>
        <Icon
          name={item.userReacted === 'likes' ? 'thumb-up' : 'thumb-up-outline'}
          color={item.userReacted === 'likes' ? '#0163d2' : '#0163d2'}
          size={20}
        />
      </TouchableOpacity>
      <Text>{item.likes}</Text>
    </View>
    <View>
      <TouchableOpacity onPress={() => handleLikeDislike(item.id, 'dislikes')}>
        <Icon
          name={item.userReacted === 'dislikes' ? 'thumb-down' : 'thumb-down-outline'}
          color={item.userReacted === 'dislikes' ? '#0163d2' : '#0163d2'}
          size={20}
        />
      </TouchableOpacity>
      <Text>{item.dislikes}</Text>
    </View>
               {/* Delete button */}
       <TouchableOpacity onPress={() => handleDeleteBlog(item.id)} style={styles.deleteButton}>
       <Icon name="delete" size={24} color="#778899" />
       </TouchableOpacity>
      </View>
      {/* Comment section */}
      <View style={styles.commentSection}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={(text) => setNewComment(text)}
        />
       <TouchableOpacity onPress={() => handleAddComment(item.id, userName,userId)}>
       <Text style={styles.commentButton}>Comment</Text>
       </TouchableOpacity>

        <FlatList
          data={item.comments}
          keyExtractor={(comment) => comment?.id?.toString()} // Assuming each comment has a unique ID
          renderItem={({ item: comment }) => (
            <View style={styles.commentContainer}>
              <Text style={styles.commentText}>{comment?.userName}: {comment?.text}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Display past blogs */}
      <FlatList data={blogs} keyExtractor={(item) => item.id} renderItem={renderBlogItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  
  userNameText: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 2, 
    color:"#000080"
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
  blogImage: {
    width: '100%', // Adjust width as needed
    height: 200, // Adjust height as needed
    resizeMode: 'cover', // Preserve aspect ratio while covering the entire container
    marginBottom: 8, // Adjust margin as needed
  },
  
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  commentSection: {
    marginTop: 8,
  },
  commentInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
  },
  commentButton: {
    color: 'blue',
  },
  commentContainer: {
    marginTop: 8,
  },
  commentText: {
    color: '#777777',
  },
  likedButton: {
    backgroundColor: '#32cd32', // Green color for liked button
    padding: 8,
    borderRadius: 4,
  },
  dislikedButton: {
    backgroundColor: '#ff0000', // Red color for disliked button
    padding: 8,
    borderRadius: 4,
  },
  interactionButton: {
    padding: 8,
    borderRadius: 4,
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default PostScreen;
