
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

// यह जाँचने के लिए कि क्या सभी आवश्यक कुंजियाँ पर्यावरण चर में मौजूद हैं।
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

// Firebase को केवल तभी प्रारंभ करें जब सभी कुंजियाँ मौजूद हों और हम ऐसे सर्वर वातावरण में न हों जहाँ यह पहले से ही प्रारंभ हो चुका हो सकता है।
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
    // यदि कुंजियाँ मौजूद नहीं हैं, तो हम कंसोल पर एक चेतावनी लॉग करते हैं।
    // ऐप चलता रहेगा, लेकिन Firebase सुविधाएँ अक्षम हो जाएँगी।
    if (process.env.NODE_ENV !== 'production') {
        console.warn("Firebase कॉन्फ़िगरेशन कुंजियाँ गुम या अधूरी हैं। Firebase सुविधाएँ अक्षम हो जाएँगी। कृपया आवश्यक कुंजियों के साथ एक .env.local फ़ाइल बनाएँ।");
    }
    // यदि कोड उन्हें एक्सेस करने का प्रयास करता है तो क्रैश को रोकने के लिए डमी ऑब्जेक्ट प्रदान करें
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
}

export { app, auth, analytics, db, storage };
