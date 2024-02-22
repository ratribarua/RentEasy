// // Import the functions you need from the SDKs you need
// import { initializeApp,getApp } from "firebase/app";
// //import { getAuth } from "firebase/auth";
// import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
// import { getFirestore,db } from "firebase/firestore/lite";
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries


import { initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth} from 'firebase/auth';
//import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgAF0Xx50mqkB5quwW-OIUPUvE2ix-Rls",
  authDomain: "renteasyproject.firebaseapp.com",
  projectId: "renteasyproject",
  storageBucket: "renteasyproject.appspot.com",
  messagingSenderId: "985083769955",
  appId: "1:985083769955:web:8153d1d4e1149e56fb3456"
};

// // initialize Firebase App
// const app = initializeApp(firebaseConfig);
// // initialize Firebase Auth for that app immediately
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });

// export { app, auth, getApp, getAuth };


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth();