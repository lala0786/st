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

let app: FirebaseApp;
let auth: Auth;
let analytics: Promise<Analytics | null> | null = null;
let db: Firestore;
let storage: FirebaseStorage;

// Initialize Firebase only if all the keys are present and we are not in a server environment where it might have been already initialized.
if (areAllKeysPresent) {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    if (typeof window !== 'undefined') {
        analytics = isSupported().then(yes => (yes ? getAnalytics(app) : null));
    }
} else {
    // If the keys are not present, we log a warning to the console.
    // The app will continue to run, but Firebase features will be disabled.
    if (process.env.NODE_ENV !== 'production') {
        console.warn("Firebase configuration keys are missing or incomplete. Firebase features will be disabled. Please create a .env.local file with the necessary keys.");
    }
    // Provide dummy objects to prevent crashes if code tries to access them
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
}

export { app, auth, analytics, db, storage };
