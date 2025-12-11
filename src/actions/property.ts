'use server';

import { adminAuth, adminDb, adminStorage } from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import { FieldValue } from 'firebase-admin/firestore';

type UploadResult = {
  success: boolean;
  error?: string;
  propertyId?: string;
};

export async function uploadPropertyAction(formData: FormData): Promise<UploadResult> {
  console.log("[Server Action] Received request.");

  // 1. Extract Data and ID Token
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

  // 2. Authentication Check: Verify the ID Token
  let userId: string;
  let userName: string | undefined;
  let userEmail: string | undefined;
  try {
    console.log("[Server Action] Verifying ID token...");
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    userId = decodedToken.uid;
    userName = decodedToken.name;
    userEmail = decodedToken.email;
    console.log(`[Server Action] Token verified for user: ${userId}`);
  } catch (error) {
    console.error('[Server Action] ID Token Verification Failed:', error);
    return { success: false, error: 'Authentication failed. Invalid or expired token.' };
  }

  const propertyId = uuidv4();
  console.log(`[Server Action] Generated new Property ID: ${propertyId}`);

  try {
    const uploadedUrls: string[] = [];
    const bucket = adminStorage.bucket();

    console.log(`[Server Action] Starting upload of ${files.length} files...`);
    for (const file of files) {
      if (file.size === 0) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${uuidv4()}-${file.name}`;
      const filePath = `properties/${propertyId}/${fileName}`;
      const fileRef = bucket.file(filePath);

      console.log(`[Server Action] Uploading ${fileName} to ${filePath}...`);
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: { uploaderId: userId, propertyId: propertyId },
        },
      });

      await fileRef.makePublic();
      const publicUrl = fileRef.publicUrl();
      uploadedUrls.push(publicUrl);
      console.log(`[Server Action] Successfully uploaded ${fileName}. Public URL: ${publicUrl}`);
    }

    if (uploadedUrls.length === 0) {
        return { success: false, error: "No valid files were uploaded." };
    }

    // 5. Save property data to Firestore
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
    console.error('[Server Action] Upload or Firestore save failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return { success: false, error: errorMessage };
  }
}

    