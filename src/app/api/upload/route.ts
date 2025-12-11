
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_PRIVATE_KEY || '{}'
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No files uploaded.' }, { status: 400 });
    }
    
    console.log(`Received ${files.length} files to upload.`);

    const bucket = getStorage().bucket();
    const urls: string[] = [];

    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uniqueFilename = `${uuidv4()}-${file.name}`;
      
      // The path in the bucket where the file will be stored
      const filePath = `properties/${uniqueFilename}`;
      
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.type,
        },
      });

      const uploadPromise = new Promise<string>((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error('Blob stream error:', err);
          reject(new Error('Something went wrong during the upload.'));
        });

        blobStream.on('finish', () => {
          // The public URL can be accessed at `https://storage.googleapis.com/[BUCKET_NAME]/[FILE_PATH]`
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          console.log(`File ${file.name} uploaded to ${publicUrl}`);
          resolve(publicUrl);
        });

        blobStream.end(fileBuffer);
      });

      urls.push(await uploadPromise);
    }
    
    console.log("All files uploaded successfully. URLs:", urls);

    return NextResponse.json({ urls }, { status: 200 });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

    