import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// TODO: 請將下方的字串替換為您在 Firebase 控制台取得的真實資訊
// 1. 前往 https://console.firebase.google.com/
// 2. 建立專案 -> Firestore Database -> 建立資料庫 (選測試模式)
// 3. 專案設定 -> 一般設定 -> 您的應用程式 (Web) -> 複製 firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyBGoH4iXdjPSYpRENEDBVUaohWEcQIKlU0",
  authDomain: "fishdex-472cd.firebaseapp.com",
  projectId: "fishdex-472cd",
  storageBucket: "fishdex-472cd.firebasestorage.app",
  messagingSenderId: "611303941562",
  appId: "1:611303941562:web:ce05fb5d23c5bec3cee983"
};

// Safety Check: Check if the user has replaced the placeholders
const isConfigured = !firebaseConfig.apiKey.includes("請貼上");

let app;
let db: Firestore | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase config is missing. Please update src/firebaseConfig.ts");
}

export { db };