// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBTHxiSzoA-QOVs6aWTIA_BH2ZK2C6wyfI",
  authDomain: "whatsapp-ba2ae.firebaseapp.com",
  databaseURL: "https://whatsapp-ba2ae-default-rtdb.firebaseio.com",
  projectId: "whatsapp-ba2ae",
  storageBucket: "whatsapp-ba2ae.firebasestorage.app",
  messagingSenderId: "731006765961",
  appId: "1:731006765961:web:1fb294453908f64628ef58",
  measurementId: "G-56HZCSNQX1"
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
export default firebase;