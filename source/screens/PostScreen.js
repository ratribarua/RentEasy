// PostScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { collection, addDoc, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PostScreen = ({ navigation }) => {
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [newComment, setNewComment] = useState('');

  //for like and dislike buttons
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [dislikedBlogs, setDislikedBlogs] = useState([]);

  useEffect(() => {
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
  const handleLike = async (blogId) => {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      const currentBlog = blogs.find((blog) => blog.id === blogId);

      if (!currentBlog.userLiked && !currentBlog.userDisliked) {
        const newLikes = currentBlog.likes + 1;
        await updateDoc(blogRef, { likes: newLikes });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, likes: newLikes, userLiked: true, userDisliked: false }
              : blog
          )
        );
      } else if (currentBlog.userLiked) {
        // User already liked, toggle to neutral
        const newLikes = currentBlog.likes - 1;
        await updateDoc(blogRef, { likes: newLikes });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, likes: newLikes, userLiked: false, userDisliked: false }
              : blog
          )
        );
      } else if (currentBlog.userDisliked) {
        // User disliked, toggle to like
        const newLikes = currentBlog.likes + 1;
        const newDislikes = currentBlog.dislikes - 1;

        await updateDoc(blogRef, { likes: newLikes, dislikes: newDislikes });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, likes: newLikes, dislikes: newDislikes, userLiked: true, userDisliked: false }
              : blog
          )
        );
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDislike = async (blogId) => {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      const currentBlog = blogs.find((blog) => blog.id === blogId);

      if (!currentBlog.userLiked && !currentBlog.userDisliked) {
        const newDislikes = currentBlog.dislikes + 1;
        await updateDoc(blogRef, { dislikes: newDislikes });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, dislikes: newDislikes, userLiked: false, userDisliked: true }
              : blog
          )
        );
      } else if (currentBlog.userDisliked) {
        // User already disliked, toggle to neutral
        const newDislikes = currentBlog.dislikes - 1;
        await updateDoc(blogRef, { dislikes: newDislikes });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, dislikes: newDislikes, userLiked: false, userDisliked: false }
              : blog
          )
        );
      } else if (currentBlog.userLiked) {
        // User liked, toggle to dislike
        const newLikes = currentBlog.likes - 1;
        const newDislikes = currentBlog.dislikes + 1;

        await updateDoc(blogRef, { likes: newLikes, dislikes: newDislikes });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, likes: newLikes, dislikes: newDislikes, userLiked: false, userDisliked: true }
              : blog
          )
        );
      }
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };
  
 
  const handleAddComment = async (blogId) => {
    try {
      if (newComment.trim() !== '') {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
          comments: [...(blogs.find((blog) => blog.id === blogId)?.comments || []), newComment],
        });

        // Clear the comment input after successfully adding a comment
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };


  const renderBlogItem = ({ item }) => (
    <View style={styles.blogItem}>
      <Text>{item.userName}'s Blog</Text>
      <Text style={styles.blogTitle}>{item.title}</Text>
      <Text style={styles.blogContent}>{item.content}</Text>
      <View style={styles.interactionContainer}>
        <Text>{item.userName}'s Blog</Text>
        <Text>Comments: {item.comments}</Text>
        <Text>Likes: {item.likes}</Text>
        <Text>Dislikes: {item.dislikes}</Text>
        {/* Like button */}
        <TouchableOpacity onPress={() => handleLike(item.id)} style={item.userLiked ? styles.likedButton : styles.interactionButton}>
          <Icon name="thumb-up-outline" color="#777777" size={20} />
        </TouchableOpacity>
        {/* Dislike button */}
        <TouchableOpacity onPress={() => handleDislike(item.id)} style={item.userDisliked ? styles.dislikedButton : styles.interactionButton}>
          <Icon name="thumb-down-outline" color="#777777" size={20} />
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
        <TouchableOpacity onPress={() => handleAddComment(item.id)}>
          <Text style={styles.commentButton}>Comment</Text>
        </TouchableOpacity>
        <FlatList
          data={item.comments}
          keyExtractor={(comment) => comment}
          renderItem={({ item: comment }) => (
            <View style={styles.commentContainer}>
              <Text style={styles.commentText}>{comment}</Text>
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
  
});

export default PostScreen;
