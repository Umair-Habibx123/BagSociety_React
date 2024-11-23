import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCTqY0RX26Caz5rfiemgQayqkeimFPA3HU",
  authDomain: "bagsociety.firebaseapp.com",
  projectId: "bagsociety",
  storageBucket: "bagsociety.firebasestorage.app",
  messagingSenderId: "231216891724",
  appId: "1:231216891724:web:3f825ffe73f1a1cfadf1e9",
  measurementId: "G-K2NR4QQTZR",
};


const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
