
// src/actions/property.ts
'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import { FieldValue } from 'firebase-admin/firestore';
import {v2 as cloudinary} from 'cloudinary';

// क्लाउडिनरी कॉन्फ़िगरेशन, पर्यावरण चर का उपयोग करके
cloudinary.config({ 
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // HTTPS URL के लिए
});

// अपलोड परिणाम के लिए टाइप परिभाषा
type UploadResult = {
  success: boolean;
  error?: string;
  propertyId?: string;
};

// Next.js सर्वर एक्शन जो संपत्ति डेटा और छवियों को संभालता है
export async function uploadPropertyAction(formData: FormData): Promise<UploadResult> {
  console.log("[सर्वर एक्शन] क्लाउडिनरी अपलोड के लिए फॉर्म डेटा प्राप्त हुआ।");

  // 1. फॉर्म डेटा से आवश्यक जानकारी निकालें
  const idToken = formData.get('idToken') as string;
  const files = formData.getAll('files') as File[];
  
  // संपत्ति का कच्चा डेटा
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

  // 2. प्रमाणीकरण और सत्यापन
  if (!idToken) {
    return { success: false, error: 'प्रमाणीकरण टोकन गुम है।' };
  }
  if (!rawData.title || files.length === 0) {
    return { success: false, error: 'शीर्षक और कम से कम एक फ़ाइल आवश्यक है।' };
  }

  let userId: string;
  let userName: string | undefined;
  let userEmail: string | undefined;
  try {
    // Firebase एडमिन SDK का उपयोग करके ID टोकन को सत्यापित करें
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    userId = decodedToken.uid;
    userName = decodedToken.name;
    userEmail = decodedToken.email;
  } catch (error) {
    console.error('[सर्वर एक्शन] ID टोकन सत्यापन विफल:', error);
    return { success: false, error: 'प्रमाणीकरण विफल। अमान्य या समाप्त हो चुका टोकन।' };
  }

  // 3. क्लाउडिनरी पर छवियाँ अपलोड करें
  const propertyId = uuidv4(); // प्रत्येक संपत्ति के लिए एक अद्वितीय आईडी
  const uploadedUrls: string[] = [];

  try {
    console.log(`[सर्वर एक्शन] क्लाउडिनरी पर ${files.length} फ़ाइलों का अपलोड शुरू हो रहा है...`);

    for (const file of files) {
      if (file.size === 0) continue; // खाली फ़ाइलों को छोड़ दें

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // क्लाउडिनरी पर स्ट्रीम के रूप में अपलोड करें
      const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `pithampur-homes/${propertyId}`, // संपत्ति-विशिष्ट फ़ोल्डर
              public_id: `${uuidv4()}-${file.name}`,   // अद्वितीय फ़ाइल नाम
              transformation: [ // छवि अनुकूलन
                { width: 1280, height: 720, crop: "limit" },
                { quality: "auto:good" },
                { fetch_format: "auto" }
              ]
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
      console.log(`[सर्वर एक्शन] क्लाउडिनरी पर सफलतापूर्वक अपलोड किया गया। सार्वजनिक URL: ${uploadResult.secure_url}`);
    }

    if (uploadedUrls.length === 0) {
        return { success: false, error: "कोई भी मान्य फ़ाइल अपलोड नहीं की गई।" };
    }

    // 4. Firestore में संपत्ति डेटा सहेजें
    console.log("[सर्वर एक्शन] Firestore में संपत्ति डेटा सहेजा जा रहा है...");
    const propertyData = {
        ...rawData,
        price: Number(rawData.price),
        area: Number(rawData.area),
        bedrooms: Number(rawData.bedrooms),
        bathrooms: Number(rawData.bathrooms),
        photos: uploadedUrls, // क्लाउडिनरी से प्राप्त URLs
        sellerId: userId,
        sellerName: userName || userEmail,
        sellerEmail: userEmail,
        createdAt: FieldValue.serverTimestamp(),
        featured: false,
        views: 0,
    };
    
    // Firestore में संपत्ति दस्तावेज़ बनाएँ
    await adminDb.collection('properties').doc(propertyId).set(propertyData);
    console.log("[सर्वर एक्शन] संपत्ति को Firestore में सफलतापूर्वक सहेजा गया।");

    // सफलता प्रतिक्रिया लौटाएँ
    return { success: true, propertyId };

  } catch (error) {
    console.error('[सर्वर एक्शन] क्लाउडिनरी अपलोड या Firestore सहेजने में विफल:', error);
    const errorMessage = error instanceof Error ? error.message : 'एक अज्ञात सर्वर त्रुटि हुई।';
    return { success: false, error: errorMessage };
  }
}
