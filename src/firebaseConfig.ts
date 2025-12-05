import * as firebase from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: 請將下方的字串替換為您在 Firebase 控制台取得的真實資訊
// 1. 前往 https://console.firebase.google.com/
// 2. 建立專案 -> Firestore Database -> 建立資料庫 (選測試模式)
// 3. 專案設定 -> 一般設定 -> 您的應用程式 (Web) -> 複製 firebaseConfig
const firebaseConfig = {
  apiKey: "請貼上您的_apiKey",
  authDomain: "請貼上您的_authDomain",
  projectId: "請貼上您的_projectId",
  storageBucket: "請貼上您的_storageBucket",
  messagingSenderId: "請貼上您的_messagingSenderId",
  appId: "請貼上您的_appId"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const db = getFirestore(app);