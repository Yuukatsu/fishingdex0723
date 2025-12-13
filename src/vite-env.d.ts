// Reference to vite/client removed to fix resolution error
// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_APP_CHECK_KEY: string;
  readonly VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN?: string;

  // Standard Vite Environment Variables
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;

  // Index signature to allow dynamic access (e.g. import.meta.env[key])
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
