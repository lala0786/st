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

// A robust check to ensure all necessary keys are strings and not just truthy.
const areAllKeysPresent = 
    typeof firebaseConfig.apiKey === 'string' &&
    typeof firebaseConfig.authDomain === 'string' &&
    typeof firebaseConfig.projectId === 'string' &&
    typeof firebaseConfig.storageBucket === 'string' &&
    typeof firebaseConfig.messagingSenderId === 'string' &&
    typeof firebaseConfig.appId === 'string' &&
    firebaseConfig.apiKey.length > 0; // Check that API key is not an empty string

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Promise<Analytics | null> | null = null;

// Initialize Firebase only if all config keys are present
if (areAllKeysPresent) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Only initialize analytics if it's supported and the app was initialized
    if (app) {
        analytics = isSupported().then(yes => (yes ? getAnalytics(app) : null));
    } else {
        analytics = Promise.resolve(null);
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Reset all to null in case of error
    app = null;
    auth = null;
    analytics = Promise.resolve(null);
  }
} else {
    // This warning is helpful for developers during setup.
    if (process.env.NODE_ENV === 'development') {
      console.warn("Firebase config is incomplete. Firebase features will be disabled. Please add your Firebase credentials to the .env file.");
    }
    // Ensure analytics is a resolved null promise if keys are missing
    analytics = Promise.resolve(null);
}

export { app, auth, analytics };
