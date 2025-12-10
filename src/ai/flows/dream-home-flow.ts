'use server';
/**
 * @fileOverview An AI agent for finding a dream home based on a description.
 *
 * - findDreamHome - A function that finds properties matching a user's dream description.
 * - DreamHomeInput - The input type for the findDreamHome function.
 * - DreamHomeOutput - The return type for the findDreamHome function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import type { Property } from '@/lib/types';


const DreamHomeInputSchema = z.object({
  description: z.string().describe("The user's description of their dream home, focusing on feelings, lifestyle, and vibe."),
});
export type DreamHomeInput = z.infer<typeof DreamHomeInputSchema>;

const PropertyFeatureSchema = z.object({
    feature: z.string().describe("A key feature or quality derived from the user's description (e.g., 'natural light', 'spacious', 'modern kitchen', 'good for entertaining')."),
    reasoning: z.string().describe("A brief explanation of why this feature is important for the user's dream home based on their description."),
});

const MatchedPropertySchema = z.object({
    id: z.string(),
    title: z.string(),
    location: z.string(),
    price: z.number(),
    photos: z.array(z.string()),
    bedrooms: z.number(),
    bathrooms: z.number(),
    area: z.number(),
    listingType: z.string(),
    matchReason: z.string().describe("An explanation of why this specific property is a good match for the user's dream home description."),
});

export const DreamHomeOutputSchema = z.object({
  keyFeatures: z.array(PropertyFeatureSchema).describe("A list of key features the AI has identified from the user's description."),
  matchedProperties: z.array(MatchedPropertySchema).describe("A list of properties that match the user's dream description."),
});
export type DreamHomeOutput = z.infer<typeof DreamHomeOutputSchema>;


export async function findDreamHome(input: DreamHomeInput): Promise<DreamHomeOutput> {
  return dreamHomeFlow(input);
}


async function getRecentProperties(count: number = 20): Promise<Property[]> {
    if (!db) {
        console.warn("Firestore is not initialized.");
        return [];
    }
    try {
        const propertiesRef = collection(db, "properties");
        const q = query(propertiesRef, limit(count));

        const querySnapshot = await getDocs(q);
        const properties: Property[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            properties.push({ 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null
            } as Property);
        });
        return properties;
    } catch (error) {
        console.error("Error fetching properties: ", error);
        return [];
    }
}

const dreamHomePrompt = ai.definePrompt({
    name: 'dreamHomePrompt',
    input: { schema: z.object({
        userDescription: z.string(),
        propertiesJson: z.string(),
    })},
    output: { schema: DreamHomeOutputSchema },
    prompt: `You are an empathetic real estate assistant. Your goal is to help a user find their dream home by understanding their emotional and lifestyle needs, not just technical specs.

User's Dream Home Description: "{{userDescription}}"

First, analyze the user's description and identify 3-5 key features or feelings they are looking for. Explain why each feature is important based on their words.

Second, I have a list of available properties in JSON format. Analyze this list and select up to 3 properties that are the best emotional and functional match for the user's dream. For each matched property, provide a compelling, personalized reason why it's a great fit, connecting it directly to the user's description.

Available Properties (JSON):
---
{{{propertiesJson}}}
---

Your response must be in a structured JSON format.`,
});


const dreamHomeFlow = ai.defineFlow(
  {
    name: 'dreamHomeFlow',
    inputSchema: DreamHomeInputSchema,
    outputSchema: DreamHomeOutputSchema,
  },
  async (input) => {
    
    const recentProperties = await getRecentProperties(20);
    
    const propertiesContext = recentProperties.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.propertyType,
        bedrooms: p.bedrooms,
        location: p.location,
        amenities: p.amenities?.join(', ') || 'none',
    }));

    const { output } = await dreamHomePrompt({
        userDescription: input.description,
        propertiesJson: JSON.stringify(propertiesContext),
    });
    
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }

    const fullMatchedProperties = output.matchedProperties.map(match => {
        const originalProperty = recentProperties.find(p => p.id === match.id);
        return {
            ...match,
            photos: originalProperty?.photos || [],
            bedrooms: originalProperty?.bedrooms || 0,
            bathrooms: originalProperty?.bathrooms || 0,
            area: originalProperty?.area || 0,
            listingType: originalProperty?.listingType || 'Sell',
        };
    });

    return {
        keyFeatures: output.keyFeatures,
        matchedProperties: fullMatchedProperties,
    };
  }
);
