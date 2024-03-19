import { initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signOut,initializeAuth, getReactNativePersistence} from 'firebase/auth';
import { getStorage} from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Firebase configuration
//renteasypro
const firebaseConfig = {
  apiKey: "AIzaSyDgAF0Xx50mqkB5quwW-OIUPUvE2ix-Rls",
  authDomain: "renteasyproject.firebaseapp.com",
  projectId: "renteasyproject",
  storageBucket: "renteasyproject.appspot.com",
  messagingSenderId: "985083769955",
  appId: "1:985083769955:web:8153d1d4e1149e56fb3456"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app)
//const auth = getAuth();


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export{auth,db,signOut, storage};