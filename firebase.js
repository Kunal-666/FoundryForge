// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0qERZX9q9d2hXM9fzxNJGSN_7iMHkoew",
  authDomain: "foundryforge-c1008.firebaseapp.com",
  projectId: "foundryforge-c1008",
  storageBucket: "foundryforge-c1008.firebasestorage.app",
  messagingSenderId: "482659692462",
  appId: "1:482659692462:web:6437e7169dda538007a23f",
  measurementId: "G-B1104YG57N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);