import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Promise<Analytics | null> | null = null;

// A robust check to ensure all necessary keys are strings and not just truthy.
const areAllKeysPresent = 
    typeof firebaseConfig.apiKey === 'string' &&
    typeof firebaseConfig.authDomain === 'string' &&
    typeof firebaseConfig.projectId === 'string' &&
    typeof firebaseConfig.storageBucket === 'string' &&
    typeof firebaseConfig.messagingSenderId === 'string' &&
    typeof firebaseConfig.appId === 'string';

// Initialize Firebase only if all config keys are present
if (areAllKeysPresent) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    analytics = isSupported().then(yes => (yes && app ? getAnalytics(app) : null));
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    app = null;
    auth = null;
    analytics = Promise.resolve(null);
  }
} else {
    // This warning is helpful for developers during setup.
    if (process.env.NODE_ENV === 'development') {
      console.warn("Firebase config is incomplete or invalid. Firebase features will be disabled.");
    }
    analytics = Promise.resolve(null);
}

export { app, auth, analytics };
