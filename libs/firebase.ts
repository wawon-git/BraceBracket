import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

// Firebase 設定（公開してもよい）
const firebaseConfig = {
  apiKey: "AIzaSyBEC4HLHfh0CbcS338ubnBr3wXEbc8ocbo",
  authDomain: "inbound-mote-367115.firebaseapp.com",
  databaseURL: "https://inbound-mote-367115-default-rtdb.firebaseio.com",
  projectId: "inbound-mote-367115",
  storageBucket: "inbound-mote-367115.appspot.com",
  messagingSenderId: "483654286704",
  appId: "1:483654286704:web:04558bb78d915d0c9963b5",
  measurementId: "G-30ZKRS9785",
}

// Firebase の初期化
const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
