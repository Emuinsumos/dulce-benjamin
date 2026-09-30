import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
    apiKey: "AIzaSyBd4mcfZH98-unKXxUKj81jnl8NK0QrDaE",
    authDomain: "dulce-benjamin.firebaseapp.com",
    databaseURL: "https://dulce-benjamin-default-rtdb.firebaseio.com",
    projectId: "dulce-benjamin",
    storageBucket: "dulce-benjamin.firebasestorage.app",
    messagingSenderId: "5815785466",
    appId: "1:5815785466:web:9745df4db2740e865d3643"
  };

if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
export const db = firebase.database();
window.db = db;
window.firebase = firebase;
