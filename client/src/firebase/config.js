// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsWn4rt8lSkpdI6AkzkUvklKuLGm-fXYo",
  authDomain: "ticketsphere-0101.firebaseapp.com",
  databaseURL: "https://ticketsphere-0101-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ticketsphere-0101",
  storageBucket: "ticketsphere-0101.firebasestorage.app",
  messagingSenderId: "200329637074",
  appId: "1:200329637074:web:bdc8b284d15ec9cdeb910b",
  measurementId: "G-D57EYNGWXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);