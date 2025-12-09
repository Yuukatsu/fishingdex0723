import * as firebase from "firebase/app";
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

let app;
let db: Firestore | null = null;
let initError: string | null = null;

// 檢查是否包含預設的佔位符文字
const isConfigured = !Object.values(firebaseConfig).some(value => value.includes("請貼上"));

if (isConfigured) {
  try {
    // Use namespace import access to avoid "no exported member" error in some TS environments
    app = firebase.initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (error: any) {
    console.error("Firebase initialization failed:", error);
    // 捕捉詳細錯誤，例如 API Key 格式不對
    initError = error.message || "Unknown Firebase initialization error";
  }
} else {
  // 設定未完成
  initError = "Firebase 設定檔尚未填寫正確的金鑰 (src/firebaseConfig.ts)";
}

export { db, initError };
