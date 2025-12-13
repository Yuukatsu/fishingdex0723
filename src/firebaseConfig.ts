
import * as firebaseApp from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
// Import App Check types
import * as appCheckModule from "firebase/app-check";

// Bypass "has no exported member" errors by casting the module to any
const { initializeApp, getApps, getApp } = firebaseApp as any;
const { initializeAppCheck, ReCaptchaV3Provider } = appCheckModule as any;

// 讀取環境變數 (Vite 專案使用 import.meta.env)
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
    
    // 初始化 App Check
    const appCheckKey = import.meta.env.VITE_FIREBASE_APP_CHECK_KEY;
    
    if (appCheckKey) {
        // 判斷是否為本地開發環境
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Debug 模式條件：1.本地端 2.有設定Debug Token 3.Vite DEV模式
        if (isLocalhost || import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN || import.meta.env.DEV) {
            (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN || true;
            console.log("⚠️ App Check: Debug Mode Enabled (Token printed in console)");
        } else {
            console.log(`🛡️ App Check: Production Mode Active for domain: ${window.location.hostname}`);
        }
        
        initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(appCheckKey),
            isTokenAutoRefreshEnabled: true
        });
        console.log("Firebase App Check initialized.");
    } else {
        console.warn("注意：未偵測到 VITE_FIREBASE_APP_CHECK_KEY，App Check 未啟用。若後端強制要求 App Check，連線將會失敗。");
    }

    console.log("Firebase & Auth initialized successfully");
  } catch (error: any) {
    console.error("Firebase initialization failed:", error);
    initError = error.message || "Unknown Firebase initialization error";
  }
}

export { db, auth, initError };

