import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity,Alert } from 'react-native';
import { collection, query, orderBy, getDocs, deleteDoc,onSnapshot, doc, updateDoc, arrayUnion ,getDoc} from 'firebase/firestore';
import { db } from './firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BlogScreen = () => {
  const [blogs, setBlogs] = useState([]);
  const [newComment, setNewComment] = useState('');

  //pagination
  const [page, setPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

 
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsRef = collection(db, 'blogs');
        const queryBlogs = query(blogsRef, orderBy('date', 'desc'));
        const unsubscribeBlogs = onSnapshot(queryBlogs, (snapshot) => {
          const blogsData = [];
          snapshot.forEach((doc) => {
            const blogData = doc.data();
            blogData.id = doc.id;
            blogsData.push(blogData);
          });
          setBlogs(blogsData);
          setTotalPages(Math.ceil(blogsData.length / ITEMS_PER_PAGE));
        });
        return () => unsubscribeBlogs();
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

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


  const handleCommentSubmit = async (blogId) => {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      await updateDoc(blogRef, {
        comments: arrayUnion({ text: newComment }) // Ensure that the comment is added as an object with a 'text' property
      });
      setNewComment(''); // Clear the comment input field after submission
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

  //pagination
  const ITEMS_PER_PAGE = 3; 

// Function to handle next page
const handleNextPage = () => {
  if (page < totalPages) {
    setPage(page + 1);
  }
};

// Function to handle previous page
const handlePrevPage = () => {
  if (page > 1) {
    setPage(page - 1);
  }
};

  const renderBlogItem = ({ item }) => (
    <View style={styles.blogContainer}>
      <Text style={styles.blogAuthor}>Posted by: {item.userName}</Text>
      <Text style={styles.blogTitle}>{item.title}</Text>
      <Text style={styles.blogContent}>{item.content}</Text>
      {item.imageURL && (
        <Image
          source={{ uri: item.imageURL }}
          style={styles.blogImage}
        />
      )}
      <View style={styles.interactionContainer}>
      <Text>Comments: {item.comments.length}</Text>
      {/* Like and dislike icons */}
      <View>
        <TouchableOpacity onPress={() => handleLikeDislike(item.id, 'likes')}>
          <Icon
            name={item.userReacted === 'likes' ? 'thumb-up' : 'thumb-up-outline'}
            color={item.userReacted === 'likes' ? '#4b0082' : '#4b0082'}
            size={20}
          />
        </TouchableOpacity>
        <Text>{item.likes}</Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => handleLikeDislike(item.id, 'dislikes')}>
          <Icon
            name={item.userReacted === 'dislikes' ? 'thumb-down' : 'thumb-down-outline'}
            color={item.userReacted === 'dislikes' ? '#4b0082' : '#4b0082'}
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
      {/* Comment Input */}
      <TextInput
        style={styles.commentInput}
        placeholder="Write a comment..."
        value={newComment}
        onChangeText={(text) => setNewComment(text)}
      />
      {/* Submit Button */}
      <TouchableOpacity
        style={styles.commentButton}
        onPress={() => handleCommentSubmit(item.id)}
        disabled={!newComment.trim()} // Disable the button if the comment is empty
      >
        <Text style={styles.commentButtonText}>Post Comment</Text>
      </TouchableOpacity>
      {/* Comments */}
      <Text style={styles.commentHeading}>Comments:</Text>
      {item.comments && item.comments.map((comment, index) => (
        <View key={index} style={styles.commentContainer}>
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* FlatList for blogs */}
      <FlatList
        data={blogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)}
        keyExtractor={(item) => item.id}
        renderItem={renderBlogItem}
      />
      {/* Pagination */}
      <View style={styles.paginationContainer}>
        {/* Previous page button */}
        <TouchableOpacity onPress={handlePrevPage} disabled={page === 1}>
          <Text style={[styles.paginationText, page === 1 && { color: 'gray' }]}>Prev</Text>
        </TouchableOpacity>
        {/* Page number */}
        <Text style={styles.paginationText}>{`${page}/${totalPages}`}</Text>
        {/* Next page button */}
        <TouchableOpacity onPress={handleNextPage} disabled={page === totalPages}>
          <Text style={[styles.paginationText, page === totalPages && { color: 'gray' }]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  blogContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  blogContent: {
    fontSize: 16,
    marginBottom: 5,
  },
  blogAuthor: {
    fontSize: 20,
    color: '#4b0082',
    fontWeight: "bold",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  commentButton: {
    backgroundColor: '#4b0082',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  commentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentContainer: {
    marginBottom: 5,
  },
  commentText: {
    marginLeft: 10,
    color: 'red',
  },
  blogImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default BlogScreen;
