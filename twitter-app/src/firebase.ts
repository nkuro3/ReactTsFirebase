import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

// add -----
// import analytics from "firebase/analytics";;

// firebase default settings -------------------
// Below can be userd from up-to-date version (v 9~). udemy version v8.10 cant use this.
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

// this doesnot work
// const analytis = analytics.getAnalytics(firebaseApp);

export const db = firebaseApp.firestore();
export const auth = firebaseApp.auth();
export const storage = firebaseApp.storage();
export const provider = new firebase.auth.GoogleAuthProvider();
