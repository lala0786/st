'use server';
/**
 * @fileOverview An AI agent for redesigning room interiors.
 *
 * - designInterior - A function that redesigns a room based on a photo, style, and prompt.
 * - InteriorDesignerInput - The input type for the designInterior function.
 * - InteriorDesignerOutput - The return type for the designInterior function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteriorDesignerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  style: z.string().describe('The desired design style for the room (e.g., "Modern", "Minimalist").'),
  prompt: z.string().describe("The user's specific instructions for the redesign."),
});
export type InteriorDesignerInput = z.infer<typeof InteriorDesignerInputSchema>;

export const InteriorDesignerOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The redesigned room image as a data URI.'),
});
export type InteriorDesignerOutput = z.infer<typeof InteriorDesignerOutputSchema>;


export async function designInterior(input: InteriorDesignerInput): Promise<InteriorDesignerOutput> {
  return interiorDesignerFlow(input);
}

const interiorDesignerFlow = ai.defineFlow(
  {
    name: 'interiorDesignerFlow',
    inputSchema: InteriorDesignerInputSchema,
    outputSchema: InteriorDesignerOutputSchema,
  },
  async (input) => {
    const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          {media: {url: input.photoDataUri}},
          {text: `You are an expert interior designer. Redesign this room in a ${input.style} style. Follow these instructions: ${input.prompt}. Only output the redesigned image, do not output any[...]`},
        ],
        config: {
          responseModalities: ['IMAGE'],
        },
      });

    if (!result.media?.url) {
        throw new Error('Image generation failed. No media URL was returned.');
    }

    return { imageDataUri: result.media.url };
  }
);
