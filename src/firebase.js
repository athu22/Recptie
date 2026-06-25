import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// TODO: Replace with actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyADtyj8w21484jsZ0yti8r8ItRaOB4kZY4",
  authDomain: "recepit-1d158.firebaseapp.com",
  databaseURL: "https://recepit-1d158-default-rtdb.firebaseio.com",
  projectId: "recepit-1d158",
  storageBucket: "recepit-1d158.firebasestorage.app",
  messagingSenderId: "747757082084",
  appId: "1:747757082084:web:de5f161fa06fae6353e3f1"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
