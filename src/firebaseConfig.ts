
import * as firebaseApp from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Bypass "has no exported member" errors by casting the module to any
// This handles cases where the typescript environment fails to detect named exports correctly
const { initializeApp, getApps, getApp } = firebaseApp as any;

// 讀取環境變數 (Vite 專案使用 import.meta.env)
// 請確保您的專案根目錄有 .env 檔案，並填入對應的數值
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db: Firestore | null = null;
let auth: Auth | null = null;
let initError: string | null = null;

// 檢查必要的環境變數是否存在
const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);

if (missingKeys.length > 0) {
  initError = `缺少環境變數: ${missingKeys.join(', ')}。請在 .env 檔案中設定。`;
  console.error(initError);
} else {
  try {
    // 避免在熱重載時重複初始化
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase & Auth initialized successfully");
  } catch (error: any) {
    console.error("Firebase initialization failed:", error);
    initError = error.message || "Unknown Firebase initialization error";
  }
}

export { db, auth, initError };
