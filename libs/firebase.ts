// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzXPL4jg_9d1nt9CBkkQ07YA57OtePrVQ",
  authDomain: "brace-bracket-rive.firebaseapp.com",
  databaseURL:
    "https://brace-bracket-rive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "brace-bracket-rive",
  storageBucket: "brace-bracket-rive.firebasestorage.app",
  messagingSenderId: "234766151609",
  appId: "1:234766151609:web:3db6b162a2ff160e631068",
  measurementId: "G-YNWX921RFK",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics only in browser environment
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export const db = getDatabase(app)
export { analytics }
