hpw to fix this error
'use server';
/**
 * @fileOverview A visual question answering agent for properties.
 *
 * - answerPropertyQuestion - A function that answers a question about a property photo.
 * - PropertyQuestionInput - The input type for the answerPropertyQuestion function.
 * - PropertyQuestionOutput - The return type for the answerPropertyQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PropertyQuestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a property, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z.string().describe('The user\'s question about the property photo.'),
});
export type PropertyQuestionInput = z.infer<typeof PropertyQuestionInputSchema>;

export const PropertyQuestionOutputSchema = z.object({
  isProperty: z.boolean().describe('Whether the image appears to contain a building or property.'),
  propertyType: z.string().describe('The type of property identified, e.g., "Apartment Building", "Detached House", "Commercial Storefront", or "Empty Plot".'),
  answer: z.string().describe("The answer to the user's question based on the photo."),
});
export type PropertyQuestionOutput = z.infer<typeof PropertyQuestionOutputSchema>;


export async function answerPropertyQuestion(input: PropertyQuestionInput): Promise<PropertyQuestionOutput> {
  return propertyQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'propertyQuestionPrompt',
  input: {schema: PropertyQuestionInputSchema},
  output: {schema: PropertyQuestionOutputSchema},
  prompt: `You are a real estate expert. Your task is to answer a question about a property, based on a photo.

First, determine if the photo actually contains a building, property, or plot of land. 
Then, identify the type of property shown.
Finally, provide a helpful and concise answer to the user's question based on the visual information in the photo.

Photo: {{media url=photoDataUri}}
Question: {{{question}}}

Answer the user's question directly, assuming the context of the image.`,
});

const propertyQuestionFlow = ai.defineFlow(
  {
    name: 'propertyQuestionFlow',
    inputSchema: PropertyQuestionInputSchema,
    outputSchema: PropertyQuestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
