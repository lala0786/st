
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Hardcoding the config directly to ensure the correct project is being used.
const firebaseConfig = {
  apiKey: "AIzaSyB0GgnTPrrdmR2iL17Td6_ZPE-H9NX0gf4",
  authDomain: "pithampur-property-hub.firebaseapp.com",
  projectId: "pithampur-property-hub",
  storageBucket: "pithampur-property-hub.appspot.com", // Corrected the storage bucket domain
  messagingSenderId: "293013275592",
  appId: "1:293013275592:web:abea85cdaab1f8b47076fd",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // This can remain as it's less critical for auth
};

// A check to see if all the necessary keys are present in the environment variables.
const areAllKeysPresent = 
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
    if (typeof window !== 'undefined') {
      console.warn("Firebase configuration keys are missing. Firebase features will be disabled.");
    }
}

export { app, auth, analytics, db, storage, areAllKeysPresent };
