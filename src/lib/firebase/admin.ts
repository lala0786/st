// src/lib/firebase/admin.ts

import * as admin from 'firebase-admin';

// 1. Construct the Service Account object from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  // Replace escaped newlines (\n) with actual newlines
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'), 
};

// 2. Check for required environment variables
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  // Log a clear error if credentials are missing
  console.error("FATAL: Firebase Admin credentials missing. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local");
}

// 3. Initialize the Admin SDK if it hasn't been already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Export server-side services
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export const adminDb = admin.firestore();