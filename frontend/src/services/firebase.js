// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBbFzETQl6bLtVfTCCazu08hJ3VBQIcOFM",
  authDomain: "pingoudindin.firebaseapp.com",
  projectId: "pingoudindin",
  storageBucket: "pingoudindin.firebasestorage.app",
  messagingSenderId: "677143647466",
  appId: "1:677143647466:web:ca815aad1fbf551d5a3393",
  measurementId: "G-H9RKG1FNSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);