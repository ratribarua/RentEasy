import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const PostScreen = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, 'posts');
        const querySnapshot = await getDocs(postsRef);
        const postsData = [];

        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          postData.id = doc.id;
          postsData.push(postData);
        });

        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleAddPost = async () => {
    try {
      const newPostData = {
        content: newPost,
        likes: 0,
        dislikes: 0,
        userId: auth.currentUser.user_id,
      };

      const docRef = await addDoc(collection(db, 'posts'), newPostData);
      setPosts([...posts, { ...newPostData, id: docRef.id }]);
      setNewPost('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likes: posts.find((post) => post.id === postId).likes + 1 });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDislike = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { dislikes: posts.find((post) => post.id === postId).dislikes + 1 });
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text>{item.content}</Text>
      <View style={styles.likeDislikeContainer}>
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
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your post here..."
        value={newPost}
        onChangeText={(text) => setNewPost(text)}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddPost}>
        <Text style={styles.buttonText}>Add Post</Text>
      </TouchableOpacity>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        style={styles.postList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  postList: {
    flex: 1,
  },
  postItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  likeDislikeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default PostScreen;
