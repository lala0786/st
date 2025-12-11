// lib/firebase/admin.ts

import * as admin from 'firebase-admin';

// 1. Construct the Service Account object from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Replace escaped newlines
};

// 2. Check for required environment variables
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error("Firebase Admin SDK Error: One or more Firebase Admin environment variables are missing or invalid.");
}

// 3. Initialize the Admin SDK if it hasn't been already
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
     console.log("Firebase Admin SDK initialized successfully.");
  } catch(e) {
    console.error("Firebase Admin SDK initialization error:", e);
  }
}

export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export const adminDb = admin.firestore();

    