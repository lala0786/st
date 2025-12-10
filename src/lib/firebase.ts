
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// A check to see if all the necessary keys are present in the environment variables.
export const areAllKeysPresent = 
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.messagingSenderId &&
    !!firebaseConfig.appId;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Promise<Analytics | null> | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Initialize Firebase only if all the keys are present.
// This prevents the app from crashing if the keys are not set.
if (areAllKeysPresent) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        if (typeof window !== 'undefined') {
            analytics = isSupported().then(yes => (yes ? getAnalytics(app as FirebaseApp) : null));
        }
    } catch (e) {
        console.error("Firebase initialization error", e);
    }
} else {
    // If the keys are not present, we log a warning to the console.
    // The app will continue to run, but Firebase features will be disabled.
    if (process.env.NODE_ENV !== 'production') {
        console.warn("Firebase configuration keys are missing or incomplete. Firebase features will be disabled. Please create a .env.local file with the necessary keys.");
    }
}

export { app, auth, analytics, db, storage };
