import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ImageBackground, Alert } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db, storage } from './firebaseConfig'; // Assuming you have 'storage' imported from Firebase.
import { Timestamp, addDoc, collection, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export default function Signup({ navigation }) {

  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [userNameErrorMessage, setUserNameErrorMessage] = useState(['', ''])
  const [birthDate, setBirthDate] = useState(moment(new Date()).format('DD/MM/YYYY'))
  const [birthDateModalStatus, setBirthDateModalStatus] = useState(false)
  const [loading, setLoading] = useState(false)
  const [semester, setSemester] = useState('')
  const [image, setImage] = useState(null); // State to store the selected image

  const userNameMessages = [
    ["This is a unique Username", 'green'],
    ["The Username has already been taken.", 'red'],
    ['', '']
  ]

  const setAllNone = () => {
    setErrorMessage('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setUserName('')
    setBirthDate('')
    setSemester('')
    setImage(null); // Reset image state
    setUserNameErrorMessage(['', ''])
  }

  useEffect(() => {
    const checkUniqueUserName = async () => {
      if (userName !== '') {
        try {
          const userRef = collection(db, "users")
          const q = query(userRef, where('userName', '==', userName))
          const querySnapshot = await getDocs(q);
          if (querySnapshot.size == 0) setUserNameErrorMessage(userNameMessages[0])
          else setUserNameErrorMessage(userNameMessages[1])
        } catch (e) {
          console.log(e)
        }
      } else setUserNameErrorMessage(userNameMessages[2])
    };
    checkUniqueUserName()

  }, [userName])

  // Function to handle image selection
// Function to handle image selection
const pickImage = async () => {
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

// Modify the uploadImage function to log errors
const uploadImage = async () => {
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
    const imageRef = ref(storageInstance, 'Images/' + imageName);
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


const doFirebaseUpdate = async () => {
  console.log("Inside doFirebaseUpdate function");
  const usersRef = collection(db, 'users');
  try {
    let imageURL = null;
    if (image) {
      console.log("Image is not null, uploading image...");
      imageURL = await uploadImage();
      console.log("Image URL after upload:", imageURL);
      if (!imageURL) {
        console.error("Failed to upload image to Firebase Storage.");
        return;
      }
    } else {
      console.log("Image is null, skipping image upload");
    }
    const docRef = await addDoc(usersRef, {
      "userName": userName,
      "semester": semester,
      "email": email,
      "dp_url": imageURL, // Add image URL to Firestore
      "joiningDate": Timestamp.fromDate(new Date()),
      'birthday': birthDate,
      "user_id": ''
    });
    console.log("Document added to Firestore successfully");
    await updateDoc(doc(db, "users", docRef.id), { "user_id": docRef.id });
    console.log("User ID updated successfully");
  } catch (e) {
    console.error("Error updating Firestore document:", e);
  }
};





  const registerWithEmail = async () => {
    try {
      setLoading(true)
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      try {
        await sendEmailVerification(user)
        console.log('Email verification link sent successfully')
      } catch (e) {
        alert("Something went wrong")
        console.log(e)
      }
      setAllNone()
      doFirebaseUpdate()
      setLoading(false)
      alert("Account Created! Please check your email and verify yourself.")
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setErrorMessage("Email has already been used")
      else if (e.code === 'auth/weak-password') setErrorMessage("Please provide a strong password")
      else if (e.code === 'auth/invalid-email') setErrorMessage("Please provide a valid email")
      alert(e.code)
      setLoading(false)
    }
  }

  const onSignUpPress = async () => {
    if (email.length === 0 ||
      password.length === 0 ||
      userName.length === 0 
      //contactNumber.length === 0
      ) {
      setErrorMessage("Please provide all the necessary information");
    } else if (email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      userName.length > 0
      //&&
      //contactNumber.length > 0
      ) {
      if (password === confirmPassword) registerWithEmail();
      else if (password !== confirmPassword) setErrorMessage("Passwords do not match");
      //else setErrorMessage("Please provide a valid username");
    } else {
      setErrorMessage("Something is missing!");
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Sign Up</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={{ color: '#4b0082', fontSize: 16 }}>Pick Profile Picture</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
        <TextInput
          style={styles.input}
          placeholderTextColor="#aaaaaa"
          placeholder='User Name'
          onChangeText={(text) => setUserName(text)}
          value={userName}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        {userNameErrorMessage[0].length > 0 && userName.length > 0 && <Text style={{ color: userNameErrorMessage[1], paddingLeft: 20, fontSize: 13 }}>{userNameErrorMessage[0]}</Text>}

        <TextInput
          style={styles.input}
          placeholderTextColor="#aaaaaa"
          placeholder='Semester'
          onChangeText={(text) => setSemester(text)}
          value={semester}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />


        <TextInput
          style={styles.input}
          placeholder='E-mail'
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
          value={email}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        {/* <TextInput
         style={styles.input}
         placeholder='Contact Number'
         placeholderTextColor="#aaaaaa"
         onChangeText={(text) => setContactNumber(text)}
         value={contactNumber}
         underlineColorAndroid="transparent"
         autoCapitalize="none"
        /> */}


        <TextInput
          style={styles.input}
          placeholderTextColor="#aaaaaa"
          secureTextEntry
          placeholder='Password'
          onChangeText={(text) => { setPassword(text); setErrorMessage('') }}
          value={password}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#aaaaaa"
          secureTextEntry
          placeholder='Confirm password'
          onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(''); }}
          value={confirmPassword}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.birthdayPicker}
          onPress={() => setBirthDateModalStatus(true)}>
          <Text style={{ marginTop: 10, fontWeight: '300', color: '#353635', fontSize: 16 }}>
            <FontAwesome name="birthday-cake" size={22} color="#e80505" /> &nbsp; &nbsp;
              {birthDate}
          </Text>
        </TouchableOpacity>
        {birthDateModalStatus && <DateTimePicker
          testID="dateTimePicker"
          value={moment(birthDate, 'DD/MM/YYYY').toDate()}
          mode="date"

          onChange={(e, date) => {
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();

            const formattedDate = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year.toString()}`;

            setBirthDate(formattedDate)
            setBirthDateModalStatus(false);
          }}
        />}
        {errorMessage.length > 0 && <Text style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</Text>}
        <TouchableOpacity
          disabled={password.length == 0 || email.length == 0}
          style={styles.button}
          onPress={() => onSignUpPress()}>
          <Text style={styles.buttonTitle}>
            {loading ? <ActivityIndicator size={20} color={"#fff"} /> : "Sign up"}
          </Text>
        </TouchableOpacity>
        <View style={styles.footerView}>
          <Text style={styles.footerText}>Already have an account? <Text onPress={() => {
            setAllNone()
            navigation.navigate('Login')
          }} style={styles.footerLink}>Log In</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  title: {
    fontSize: 30,
    marginBottom: 10,
    color: '#4b0082',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 60,
    //borderColor: 'gray',
    //borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    backgroundColor: '#e6e6fa',
    //borderRadius: 12,
  },
  birthdayPicker: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    color: 'blue',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    paddingLeft: 16
  },
  button: {
    backgroundColor: '#32cd32',
    padding: 15,
    borderRadius: 150,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 350,
  },
  buttonTitle: {
    color: '#4b0082',
    fontSize: 25,
  },
  footerView: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#38598b',
  },
  footerLink: {
    color: '#8b008b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePickerButton: {
    backgroundColor: '#e6e6fa',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    height: 40,
  },
  imagePreview: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 90,
    marginTop: 5,
    marginBottom: 5,
    alignSelf: 'center',
  },
});













// import React, { useRef, useState, useEffect } from 'react';
// import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ImageBackground } from 'react-native';
// import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
// import { auth, db } from './firebaseConfig';
// import { Timestamp, addDoc, collection, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import moment from 'moment';
// import { FontAwesome } from '@expo/vector-icons';


// export default function Signup({navigation}) {

//   const [userName, setUserName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [errorMessage, setErrorMessage] = useState('')
//   const [userNameErrorMessage, setUserNameErrorMessage] = useState(['', ''])
//   const [birthDate, setBirthDate] = useState(moment(new Date()).format('DD/MM/YYYY'))
//   const [birthDateModalStatus, setBirthDateModalStatus] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [semester, setSemester] = useState('')
//   //const [contactNumber, setContactNumber] = useState('')


//   const userNameMessages = [
//     ["This is a unique Username", 'green'],
//     ["The Username has already been taken.", 'red'],
//     ['', '']
//   ]

//   const setAllNone = () => {
//     setErrorMessage('')
//     setEmail('')
//     setPassword('')
//     setConfirmPassword('')
//     setUserName('')
//     setBirthDate('')
//     setSemester('')
//     //setContactNumber('')
//     setUserNameErrorMessage(['', ''])
//   }

//   useEffect(() => {
//     const checkUniqueUserName = async () => {
//       if (userName !== '') {
//         try {
//           const userRef = collection(db, "users")
//           const q = query(userRef, where('userName', '==', userName))
//           const querySnapshot = await getDocs(q);
//           if (querySnapshot.size == 0) setUserNameErrorMessage(userNameMessages[0])
//           else setUserNameErrorMessage(userNameMessages[1])
//         } catch (e) {
//           console.log(e)
//         }
//       } else setUserNameErrorMessage(userNameMessages[2])
//     };
//     checkUniqueUserName()

//   }, [userName])

//   const doFireBaseUpdate = async () => {
//     const usersRef = collection(db, 'users');
//     try {

//       const docRef = await addDoc(usersRef, {
//         "userName": userName,
//         "semester": semester,
//         "email": email,
//         //"Phone_Number": contactNumber,
//         "dp_url": "../../assets/Av.png",
//         "joiningDate": Timestamp.fromDate(new Date()),
//         'birthday': birthDate,
//         "user_id": ''
//       });

//       updateDoc(doc(db, "users", docRef.id), { "user_id": docRef.id })
//     } catch (e) {
//       console.log(e)
//     }
//   }

//   const registerWithEmail = async () => {
//     try {
//       setLoading(true)
//       const { user } = await createUserWithEmailAndPassword(auth, email, password)
//       try {
//         await sendEmailVerification(user)
//         console.log('Email verification link sent successfully')
//       } catch (e) {
//         alert("Something went wrong")
//         console.log(e)
//       }
//       setAllNone()
//       doFireBaseUpdate()
//       setLoading(false)
//       alert("Account Created! Please check your email and verify yourself.")
//     } catch (e) {
//       if (e.code === 'auth/email-already-in-use') setErrorMessage("Email has already been used")
//       else if (e.code === 'auth/weak-password') setErrorMessage("Please provide a strong password")
//       else if (e.code === 'auth/invalid-email') setErrorMessage("Please provide a valid email")
//       alert(e.code)
//       setLoading(false)
//     }
//   }

//   const onSignUpPress = async () => {
//     if (email.length === 0 ||
//         password.length === 0 || 
//         userName.length === 0 
//         //|| 
//         //contactNumber.length === 0
//         ) {
//       setErrorMessage("Please provide all the necessary information");
//     } else if (email.length > 0 && 
//                password.length > 0 && 
//                confirmPassword.length > 0 && 
//                userName.length > 0 
//                //&&
//                //contactNumber.length > 0
//                ) {
//       if (password === confirmPassword ) registerWithEmail();
//       else if (password !== confirmPassword) setErrorMessage("Passwords do not match");
//       //else setErrorMessage("Please provide a valid username");
//     } else {
//       setErrorMessage("Something is missing!");
//     }
//   };

  
//   return (
//       <ScrollView contentContainerStyle={styles.container}>
//         <View>
//           <Text style={styles.title}>Sign Up</Text>
//           <TextInput
//             style={styles.input}
//             placeholderTextColor="#aaaaaa"
//             placeholder='User Name'
//             onChangeText={(text) => setUserName(text)}
//             value={userName}
//             underlineColorAndroid="transparent"
//             autoCapitalize="none"
//           />
//           {userNameErrorMessage[0].length > 0 && userName.length > 0 && <Text style={{ color: userNameErrorMessage[1], paddingLeft: 20, fontSize: 13 }}>{userNameErrorMessage[0]}</Text>}
          
//           <TextInput
//             style={styles.input}
//             placeholderTextColor="#aaaaaa"
//             placeholder='Semester'
//             onChangeText={(text) => setSemester(text)}
//             value={semester}
//             underlineColorAndroid="transparent"
//             autoCapitalize="none"
//           />


//           <TextInput
//             style={styles.input}
//             placeholder='E-mail'
//             placeholderTextColor="#aaaaaa"
//             onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
//             value={email}
//             underlineColorAndroid="transparent"
//             autoCapitalize="none"
//           />
//           {/* <TextInput
//            style={styles.input}
//            placeholder='Contact Number'
//            placeholderTextColor="#aaaaaa"
//            onChangeText={(text) => setContactNumber(text)}
//            value={contactNumber}
//            underlineColorAndroid="transparent"
//            autoCapitalize="none"
//           /> */}


//           <TextInput
//             style={styles.input}
//             placeholderTextColor="#aaaaaa"
//             secureTextEntry
//             placeholder='Password'
//             onChangeText={(text) => { setPassword(text); setErrorMessage('') }}
//             value={password}
//             underlineColorAndroid="transparent"
//             autoCapitalize="none"
//           />
//           <TextInput
//             style={styles.input}
//             placeholderTextColor="#aaaaaa"
//             secureTextEntry
//             placeholder='Confirm password'
//             onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(''); }}
//             value={confirmPassword}
//             underlineColorAndroid="transparent"
//             autoCapitalize="none"
//           />
//           <TouchableOpacity
//             style={styles.birthdayPicker}
//             onPress={() => setBirthDateModalStatus(true)}>
//             <Text style={{ marginTop: 10, fontWeight: '300', color: '#353635', fontSize: 16 }}>
//               <FontAwesome name="birthday-cake" size={22} color="#e80505" /> &nbsp; &nbsp;
//               {birthDate}
//             </Text>
//           </TouchableOpacity>
//           {birthDateModalStatus && <DateTimePicker
//           testID="dateTimePicker"
//           value={moment(birthDate, 'DD/MM/YYYY').toDate()}
//           mode="date"

//           onChange={(e, date) => {
//             const day = date.getDate();
//             const month = date.getMonth();
//             const year = date.getFullYear();

//             const formattedDate = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year.toString()}`;

//             setBirthDate(formattedDate)
//             setBirthDateModalStatus(false);
//           }}
//         />}
//           {errorMessage.length > 0 && <Text style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</Text>}
//           <TouchableOpacity
//             disabled={password.length == 0 || email.length == 0}
//             style={styles.button}
//             onPress={() => onSignUpPress()}>
//             <Text style={styles.buttonTitle}>
//               {loading ? <ActivityIndicator size={20} color={"#fff"} /> : "Sign up"}
//             </Text>
//           </TouchableOpacity>
//           <View style={styles.footerView}>
//             <Text style={styles.footerText}>Already have an account? <Text onPress={() => {
//               setAllNone()
//               navigation.navigate('Login')
//             }} style={styles.footerLink}>Log In</Text></Text>
//           </View>
//         </View>
//       </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding:10,
//   },

//   title: {
//     fontSize: 30,
//     marginBottom: 10,
//     color: '#4b0082',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   input: {
//     height: 60,
//     //borderColor: 'gray',
//     //borderWidth: 1,
//     marginBottom: 16,
//     paddingLeft: 8,
//     backgroundColor: '#e6e6fa',
//     //borderRadius: 12,
//   },
//   birthdayPicker: {
//     height: 48,
//     borderRadius: 5,
//     overflow: 'hidden',
//     backgroundColor: 'white',
//     color: 'blue',
//     marginTop: 10,
//     marginBottom: 10,
//     marginLeft: 15,
//     marginRight: 15,
//     paddingLeft: 16
//   },
//   button: {
//     backgroundColor: '#32cd32',
//     padding: 15,
//     borderRadius: 150,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 350,
//   },
//   buttonTitle: {
//     color: '#4b0082',
//     fontSize: 25,
//   },
//   footerView: {
//     marginTop: 20,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   footerText: {
//     fontSize: 16,
//     color: '#38598b',
//   },
//   footerLink: {
//     color: '#8b008b',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });