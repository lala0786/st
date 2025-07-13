"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, Sparkles, Building, HelpCircle, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { answerPropertyQuestion, PropertyQuestionOutput } from '@/ai/flows/property-qa-flow';
import { Badge } from '@/components/ui/badge';

export default function PropertyQAPage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PropertyQuestionOutput | null>(null);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPhoto(file);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !question) {
      toast({
        title: 'Missing Information',
        description: 'Please upload a photo and ask a question.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const photoDataUri = await fileToDataUri(photo);
      const response = await answerPropertyQuestion({ photoDataUri, question });
      setResult(response);
    } catch (error) {
      console.error('Error answering question:', error);
      toast({
        title: 'Error',
        description: 'Could not get an answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline flex items-center gap-2">
              <Sparkles className="text-primary" /> AI Property Assistant
            </CardTitle>
            <CardDescription>
              Have a question about a property? Upload a photo and ask our AI.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="photo-upload">Property Photo</Label>
                <label htmlFor="photo-upload" className="block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  {photoPreview ? (
                    <Image src={photoPreview} alt="Property preview" width={400} height={250} className="mx-auto rounded-md object-contain max-h-56" />
                  ) : (
                      <>
                          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Click to upload</span> a photo
                          </p>
                      </>
                  )}
                  <Input id="photo-upload" type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">Your Question</Label>
                <Textarea
                  id="question"
                  placeholder="e.g., What style of architecture is this? or What improvements could I make to increase its value?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="resize-y min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading || !photo || !question} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  'Ask AI'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="flex flex-col">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Bot className="text-primary" /> AI Response
             </CardTitle>
             <CardDescription>The AI's analysis will appear here.</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow flex items-center justify-center">
              {loading ? (
                 <div className="text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Analyzing image and question...</p>
                 </div>
              ) : result ? (
                 <div className="space-y-4 w-full">
                    {result.isProperty ? (
                       <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                          <Building className="h-6 w-6 text-secondary" />
                          <div>
                            <p className="font-semibold">Property Identified</p>
                            <p className="text-sm text-muted-foreground">{result.propertyType}</p>
                          </div>
                       </div>
                    ) : (
                       <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                          <HelpCircle className="h-6 w-6 text-accent" />
                           <div>
                              <p className="font-semibold">No Property Detected</p>
                              <p className="text-sm text-muted-foreground">The AI could not identify a property in the image.</p>
                          </div>
                       </div>
                    )}
                    <div>
                        <h3 className="font-semibold mb-2">Answer:</h3>
                        <p className="text-muted-foreground leading-relaxed">{result.answer}</p>
                    </div>
                 </div>
              ) : (
                <div className="text-center text-muted-foreground">
                    <p>Upload a photo and ask a question to get started.</p>
                </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
