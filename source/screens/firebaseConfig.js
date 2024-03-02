import { initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Firebase configuration
//RentEasy
const firebaseConfig = {
  apiKey: "AIzaSyBEqWzcPEAiWv4nQidKBHbXtEgZ4gIu1tc",
  authDomain: "renteasy-1460d.firebaseapp.com",
  databaseURL: "https://renteasy-1460d-default-rtdb.firebaseio.com",
  projectId: "renteasy-1460d",
  storageBucket: "renteasy-1460d.appspot.com",
  messagingSenderId: "924037663509",
  appId: "1:924037663509:web:26b0c1c3873a02a174771c"
};




export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth();