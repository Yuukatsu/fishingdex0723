
import * as firebaseApp from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
// Import App Check types
import * as appCheckModule from "firebase/app-check";

// Bypass "has no exported member" errors by casting the module to any
const { initializeApp, getApps, getApp } = firebaseApp as any;
const { initializeAppCheck, ReCaptchaV3Provider } = appCheckModule as any;

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
    
    // 初始化 App Check
    // 需在 .env 中設定 VITE_FIREBASE_APP_CHECK_KEY (ReCAPTCHA v3 Site Key)
    const appCheckKey = import.meta.env.VITE_FIREBASE_APP_CHECK_KEY;
    if (appCheckKey) {
        // 在開發環境下啟用 Debug Token，方便在 localhost 測試
        // 請在瀏覽器 Console 複製 "App Check debug token" 並貼到 Firebase Console -> App Check -> Apps -> Manage debug tokens
        if (import.meta.env.DEV) {
            (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        }
        
        initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(appCheckKey),
            isTokenAutoRefreshEnabled: true
        });
        console.log("Firebase App Check initialized with ReCAPTCHA v3");
    } else {
        console.warn("App Check key not found. App Check is disabled.");
    }

    console.log("Firebase & Auth initialized successfully");
  } catch (error: any) {
    console.error("Firebase initialization failed:", error);
    initError = error.message || "Unknown Firebase initialization error";
  }
}

export { db, auth, initError };

