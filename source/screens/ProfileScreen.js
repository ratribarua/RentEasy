import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, Modal, Image } from 'react-native';
import { Avatar, Title, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RatingScreen from './RatingScreen';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';

const ProfileScreen = () => {
    //get user info states
    const [userData, setUserData] = useState(null);
    const navigation = useNavigation();

    //blog states
    const [newBlogTitle, setNewBlogTitle] = useState('');
    const [newBlogContent, setNewBlogContent] = useState('');
    const [image, setImage] = useState(null);

    //camera
    const [isCameraVisible, setCameraVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    // Declare cameraRef
    const cameraRef = useRef(null);

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

    //check if log in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                getUserData();
            } else {
                // No user is signed in, navigate to the login screen or show a message
                Alert('');
                navigation.replace('Login');
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

    // Open the camera
    const openCamera = () => {
        setCameraVisible(true);
    };

    // Close the camera
    const closeCamera = () => {
        setCameraVisible(false);
    };

    //permission for camera access
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access camera was denied');
            }
        })();
    }, []);

    // Function to handle capturing an image
    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const { uri } = await cameraRef.current.takePictureAsync();
                console.log("Captured image URI:", uri); // Log the URI of the captured image
                setCapturedImage(uri);
                setImage(uri); // Set the captured image URI to the image state variable
                closeCamera(); // Close the camera modal after capturing the image
            } catch (error) {
                console.error("Error taking picture:", error); // Log any errors that occur during picture taking
            }
        }
    };

    // Function to handle image selection
    const selectImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            // Log the result object
            console.log("Result:", result);

            if (!result.canceled) {
                setImage(result.assets[0].uri); // Check this line
                console.log("Selected image URI:", result.assets[0].uri);
            } else {
                console.log("Image picking cancelled");
            }

        } catch (error) {
            console.log("Error picking image:", error);
        }
    };

    //post image upload
    const uploadImage = async (userName) => {
        try {
            console.log("Inside uploadImage function");
            const response = await fetch(image);
            console.log("Fetched image successfully");
            const blob = await response.blob();
            console.log("Converted image to blob successfully");
            const imageName = userName + '_' + Date.now(); // Unique image name
            console.log("Image name:", imageName);

            // Initialize storage instance using getStorage function
            const storageInstance = getStorage();

            // Create a reference to the desired location
            const imageRef = ref(storageInstance, 'blogImages/' + imageName);
            console.log("Image reference:", imageRef);

            // Upload blob to the reference
            await uploadBytes(imageRef, blob);
            console.log("Image uploaded to Firebase Storage successfully");

            // Get download URL
            const downloadURL = await getDownloadURL(imageRef);
            console.log("Download URL:", downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading image to Firebase Storage:", error);
            return null;
        }
    };

    // Post new blog
    const handlePostBlog = async () => {
        try {
            const date = new Date().toISOString();
            let imageURL = null;

            // Check if an image is selected
            if (image) {
                // Upload the image to Firebase Storage
                imageURL = await uploadImage(userData.userName);
            }

            // Simplify the structure of blogData
            const blogData = {
                title: newBlogTitle,
                content: newBlogContent,
                likes: 0, // Initialize likes with 0
                dislikes: 0, // Initialize dislikes with 0
                comments: [], // Initialize comments as an empty array
                date: date,
                imageURL: imageURL,
                userName: userData.userName, // Add userName to blogData
                userId: userData.userRef // Add userId to blogData
            };

            // Add the blog data to Firestore
            const blogsRef = collection(db, 'blogs');
            const docRef = await addDoc(blogsRef, blogData);
            const blogId = docRef.id; // Get the ID of the newly added blog

            console.log('Blog posted successfully!');

            // Reset input text and image
            setNewBlogTitle('');
            setNewBlogContent('');
            setImage(null);

            // Provide user feedback or navigate back to the profile screen
            Alert.alert('Success', 'Blog posted successfully', [{ text: 'OK', onPress: () => navigation.navigate('ProfileScreen') }]);
        } catch (error) {
            console.error('Error posting blog:', error);
            Alert.alert('Error', 'Failed to post blog. Please try again.');
        }
    };

    // Function to navigate to ViewAllBooks page with userName
    const navigateToViewAllBooks = (userName, userId) => {
        navigation.navigate('ViewAllBooks', { userName: userName, userId: userId });
    };

    const navigateToMyBooks = (userName, userId) => {
        navigation.navigate('MyBooks', { userName: userName, userId: userId });
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
                                    <Title style={[styles.title, { marginTop: 15, marginBottom: 5, color: "#4b0082" }]}>{userData?.userName}</Title>
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
                                <Text style={{ marginLeft: 20, color: '#00008b', fontSize: 18, backgroundColor: "#dcdcdc" }}>Semester : {userData?.semester}</Text>
                            </View>
                            <View style={styles.row}>
                                <Icon name="google" color="#6495ed" size={25} />
                                <Text style={{ marginLeft: 20, color: '#00008b', fontSize: 18, backgroundColor: "#dcdcdc" }}>{userData?.email}</Text>
                            </View>
                        </View>
                        <View style={styles.bellIconContainer}>
                            <View style={styles.bellIconRow}>
                                <TouchableOpacity>
                                    <Icon name="bell" color="#6495ed" size={25} style={styles.bellIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Picker
                                selectedValue={null}
                                onValueChange={(itemValue, itemIndex) => {
                                    switch (itemValue) {
                                        case 'ViewAllBooks':
                                            navigateToViewAllBooks(userData.userName, userData.userRef);
                                            break;
                                        case 'MyBooks':
                                            navigateToMyBooks(userData.userName, userData.userRef);
                                            break;
                                        case 'profileUpdate':
                                            navigation.navigate('ProfileUpdate');
                                            break;
                                        case 'logout':
                                            handleLogout();
                                            break;
                                        case 'postScreen':
                                            navigation.navigate('BlogScreen');
                                            break;
                                        default:
                                            break;
                                    }
                                }}

                            >
                                <Picker.Item label="See More" value={null} style={{ fontSize: 20, padding: 150, color: "#9370db", fontWeight: "bold" }} />
                                <Picker.Item label="All Books" value="ViewAllBooks" style={{ fontSize: 18, padding: 150, fontWeight: "bold" }} />
                                <Picker.Item label="My Books" value="MyBooks" style={{ fontSize: 18, padding: 150, fontWeight: "bold" }} />
                                <Picker.Item label="See Blog" value="postScreen" style={{ fontSize: 18, padding: 150, fontWeight: "bold" }} />
                                <Picker.Item label="Edit Profile" value="profileUpdate" style={{ fontSize: 18, padding: 150, fontWeight: "bold" }} />

                                <Picker.Item label="Logout" value="logout" style={{ fontSize: 18, padding: 150, fontWeight: "bold" }} />


                            </Picker>

                        </View>

                        {auth.currentUser && (
                            <View>
                                <View style={styles.plusIconContainer}>
                                    <Text style={styles.plusIconLabel}>Add Book</Text>
                                    <IconButton
                                        icon="plus"
                                        color="#4b0082"
                                        size={30}
                                        onPress={() => {
                                            navigation.navigate('AddBooks', { userName: userData.userName, userId: userData.userRef });
                                        }}
                                    />
                                </View>
                                {/* Blog posting section */}
                                <View style={styles.blogPostSection}>
                                    <Text style={styles.heading}>
                                        Post Your Books
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Title of the book..."
                                        value={newBlogTitle}
                                        onChangeText={(text) => setNewBlogTitle(text)}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Write your book details here..."
                                        multiline
                                        value={newBlogContent}
                                        onChangeText={(text) => setNewBlogContent(text)}
                                    />
                                    {/* Image picker */}
                                    <View style={styles.imagePickerContainer}>
                                        <IconButton
                                            icon="image"
                                            color="#4b0082"
                                            size={25}
                                            onPress={selectImage}
                                            style={styles.imagePickerIcon}
                                        />
                                        <Text style={styles.imagePickerText}>Choose Picture</Text>
                                    </View>
                                    {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
                                    {/* Button to open the camera */}
                                    <TouchableOpacity onPress={openCamera}>
                                        <View style={styles.menuItem}>
                                            <Icon name="camera" color="#4b0082" size={25} />
                                            <Text style={styles.menuItemText}>Take Picture</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Camera Modal */}
                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={isCameraVisible}
                                        onRequestClose={closeCamera}
                                    >
                                        <View style={styles.cameramodalContainer}>
                                            <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back}>

                                                <View style={styles.cameraButtons}>
                                                    <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                                                        <Icon name="camera" color="white" size={30} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.cameraButton} onPress={closeCamera}>
                                                        <Icon name="close" color="white" size={30} />
                                                    </TouchableOpacity>
                                                </View>
                                            </Camera>
                                        </View>
                                    </Modal>
                                    <TouchableOpacity
                                        style={[styles.addButton, !newBlogTitle && !newBlogContent && !image && styles.disabledButton]}
                                        onPress={handlePostBlog} // Pass userName and userID to handlePostBlog
                                        disabled={!newBlogTitle && !newBlogContent && !image}
                                    >
                                        <Text style={styles.buttonText}>Upload Blog</Text>
                                    </TouchableOpacity>


                                </View>
                            </View>
                        )}
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
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    plusIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 8,
        padding: 2,
        marginBottom: 30,
        marginTop: 8,
        width: "50%",
        alignSelf: 'center',
    },

    plusIconLabel: {
        color: '#4b0082',
        fontSize: 18,
        lineHeight: 26,
        marginRight: 5,
    },
    blogPostSection: {
        padding: 16,
        paddingTop: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#4b0082',
        marginBottom: 20,
        width: "90%",
        alignSelf: 'center',
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
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#4b0082',
    },
    imagePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagePickerText: {
        marginLeft: 10,
        color: '#4b0082',
        fontSize: 18,
    },
    imagePickerIcon: {
        padding: 10,
        borderRadius: 0,
        alignItems: 'center',
        marginTop: 1,
        marginBottom: 10,
        height: 40,
    },
    imagePreview: {
        width: 200,
        height: 200,
        resizeMode: "contain",
        borderRadius: 0,
        marginBottom: 10,
        alignSelf: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        padding: 8,
    },
    addButton: {
        backgroundColor: '#4b0082',
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
        color: '#4b0082',
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
        right: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cameramodalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    cameraButtons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        width: '100%',
    },
    cameraButton: {
        marginHorizontal: 20,

    },
    bellIconContainer: {
        marginBottom: 10,
        paddingHorizontal: 30,
    },
    bellIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bellIcon: {
        marginRight: 10,
    },

});

export default ProfileScreen;
