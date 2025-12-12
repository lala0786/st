
// src/lib/firebase/admin.ts

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// 1. पर्यावरण चर से सेवा खाता ऑब्जेक्ट बनाएँ
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  // एस्केप किए गए न्यूलाइन (\n) को वास्तविक न्यूलाइन से बदलें
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'), 
};

// 2. आवश्यक पर्यावरण चर की जाँच करें
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  // यदि क्रेडेंशियल गुम हैं तो एक स्पष्ट त्रुटि लॉग करें
  console.error("FATAL: Firebase एडमिन क्रेडेंशियल गुम हैं। अपने पर्यावरण चर में FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, और FIREBASE_ADMIN_PRIVATE_KEY की जाँच करें।");
}

// 3. यदि एडमिन SDK पहले से प्रारंभ नहीं किया गया है तो इसे प्रारंभ करें
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
     console.log("Firebase एडमिन SDK सफलतापूर्वक प्रारंभ हो गया।");
  } catch (error) {
     console.error("Firebase एडमिन SDK प्रारंभ करने में विफल:", error);
  }
}

// सर्वर-साइड सेवाओं का निर्यात करें
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export const adminDb = admin.firestore();
export { FieldValue };
