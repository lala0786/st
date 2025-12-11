// src/actions/property.ts
'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import { FieldValue } from 'firebase-admin/firestore';
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

type UploadResult = {
  success: boolean;
  error?: string;
  propertyId?: string;
};

export async function uploadPropertyAction(formData: FormData): Promise<UploadResult> {
  console.log("[Server Action] Received form data for Cloudinary upload.");

  const idToken = formData.get('idToken') as string;
  const files = formData.getAll('files') as File[];
  
  const rawData = {
    title: formData.get('title') as string,
    propertyType: formData.get('propertyType') as string,
    listingType: formData.get('listingType') as string,
    price: formData.get('price') as string,
    area: formData.get('area') as string,
    bedrooms: formData.get('bedrooms') as string,
    bathrooms: formData.get('bathrooms') as string,
    location: formData.get('location') as string,
    description: formData.get('description') as string,
  }

  if (!idToken) {
    return { success: false, error: 'Authentication token is missing.' };
  }
  if (!rawData.title || files.length === 0) {
    return { success: false, error: 'Title and at least one file are required.' };
  }

  let userId: string;
  let userName: string | undefined;
  let userEmail: string | undefined;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    userId = decodedToken.uid;
    userName = decodedToken.name;
    userEmail = decodedToken.email;
  } catch (error) {
    console.error('[Server Action] ID Token Verification Failed:', error);
    return { success: false, error: 'Authentication failed. Invalid or expired token.' };
  }

  const propertyId = uuidv4();
  const uploadedUrls: string[] = [];

  try {
    console.log(`[Server Action] Starting upload of ${files.length} files to Cloudinary...`);

    for (const file of files) {
      if (file.size === 0) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `pithampur-homes/${propertyId}`,
              public_id: `${uuidv4()}-${file.name}`
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(buffer);
      });
      
      uploadedUrls.push(uploadResult.secure_url);
      console.log(`[Server Action] Successfully uploaded to Cloudinary. Public URL: ${uploadResult.secure_url}`);
    }

    if (uploadedUrls.length === 0) {
        return { success: false, error: "No valid files were uploaded." };
    }

    console.log("[Server Action] Saving property data to Firestore...");
    const propertyData = {
        ...rawData,
        price: Number(rawData.price),
        area: Number(rawData.area),
        bedrooms: Number(rawData.bedrooms),
        bathrooms: Number(rawData.bathrooms),
        photos: uploadedUrls,
        sellerId: userId,
        sellerName: userName || userEmail,
        sellerEmail: userEmail,
        createdAt: FieldValue.serverTimestamp(),
        featured: false,
        views: 0,
    };
    
    await adminDb.collection('properties').doc(propertyId).set(propertyData);
    console.log("[Server Action] Successfully saved property to Firestore.");

    return { success: true, propertyId };

  } catch (error) {
    console.error('[Server Action] Cloudinary upload or Firestore save failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return { success: false, error: errorMessage };
  }
}
