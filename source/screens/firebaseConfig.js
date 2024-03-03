import { initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signOut} from 'firebase/auth';
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




// const firebaseConfig = {
//   apiKey: "AIzaSyBEqWzcPEAiWv4nQidKBHbXtEgZ4gIu1tc",
//   authDomain: "renteasy-1460d.firebaseapp.com",
//   databaseURL: "https://renteasy-1460d-default-rtdb.firebaseio.com",
//   projectId: "renteasy-1460d",
//   storageBucket: "renteasy-1460d.appspot.com",
//   messagingSenderId: "924037663509",
//   appId: "1:924037663509:web:26b0c1c3873a02a174771c"
// };




const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth();

export{auth,db,signOut};