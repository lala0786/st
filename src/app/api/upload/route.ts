import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';

// IMPORTANT: Set these environment variables in your .env.local file
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK only once
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
     console.log("Firebase Admin SDK initialized successfully.");
  } catch(e) {
    console.error("Firebase Admin SDK initialization error:", e);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No files uploaded.' }, { status: 400 });
    }
    
    console.log(`[API Route] Received ${files.length} files to upload.`);

    const bucket = getStorage().bucket();
    const urls: string[] = [];

    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      // Create a unique filename to avoid overwrites
      const uniqueFilename = `${Date.now()}-${uuidv4()}-${file.name}`;
      
      const filePath = `properties/${uniqueFilename}`;
      
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.type,
        },
      });

      const uploadPromise = new Promise<string>((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error('[API Route] Blob stream error:', err);
          reject(new Error('Something went wrong during the upload.'));
        });

        blobStream.on('finish', () => {
          // The public URL can be accessed at `https://storage.googleapis.com/[BUCKET_NAME]/[FILE_PATH]`
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          console.log(`[API Route] File ${file.name} uploaded to ${publicUrl}`);
          resolve(publicUrl);
        });

        blobStream.end(fileBuffer);
      });

      urls.push(await uploadPromise);
    }
    
    console.log("[API Route] All files uploaded successfully. URLs:", urls);

    return NextResponse.json({ urls }, { status: 200 });

  } catch (error) {
    console.error('[API Route] General Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}