import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2RYtZ0Ac-Jq9F76SYZKUn3Sk8-VFTY4E", // Verify this
  authDomain: "campus-delivery-db914.firebaseapp.com", // Verify this
  projectId: "campus-delivery-db914", // Verify this
  storageBucket: "campus-delivery-db914.appspot.com", // Verify this
  messagingSenderId: "523367970412", // Verify this
  appId: "1:523367970412:web:a26a453902059d05134a49", // Verify this
  measurementId: "G-8P4SYE3WJ4" // Verify this
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };