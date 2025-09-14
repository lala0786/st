"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Wand2, Lightbulb, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { findDreamHome, DreamHomeOutput } from '@/ai/flows/dream-home-flow';
import { PropertyCard } from '@/components/property-card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

const examplePrompts = [
  "I'm looking for a quiet, peaceful home with a small garden where I can drink my morning tea.",
  "I want a modern, stylish apartment in the city center, perfect for hosting parties with friends.",
  "A family-friendly house with lots of natural light, a safe play area for kids, and an open kitchen.",
  "A bachelor pad with a great view, minimalist design, and close to gyms and nightlife."
];

export default function DreamHomePage() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamHomeOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      toast({
        title: 'Description is empty',
        description: 'Please describe your dream home.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await findDreamHome({ description });
      setResult(response);
    } catch (error) {
      console.error('Error finding dream home:', error);
      toast({
        title: 'Error',
        description: 'Could not find matches at this time. The AI might be busy. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleExampleClick = (prompt: string) => {
    setDescription(prompt);
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
            <Wand2 className="text-primary" /> AI Dream Home Finder
          </CardTitle>
          <CardDescription>
            Stop searching, start feeling. Describe the vibe of your perfect home, and let our AI find it for you.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <Textarea
              id="dream-description"
              placeholder="e.g., 'I want a cozy place with a balcony to watch the sunset' or 'a spacious home with a modern kitchen for my family'..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] text-base p-4"
            />
             <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Don't know where to start? Try an example:</p>
                <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((prompt, i) => (
                        <Button key={i} type="button" variant="outline" size="sm" onClick={() => handleExampleClick(prompt)}>
                            {prompt.substring(0, 30)}...
                        </Button>
                    ))}
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} size="lg" className="w-full max-w-sm mx-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Your Dream Home...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Find My Match
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {loading && (
        <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Our AI is dreaming up your perfect home...</p>
        </div>
      )}

      {result && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Here's What Our AI Understood</h2>
            <p className="text-muted-foreground">Based on your description, you're looking for a home with these qualities:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {result.keyFeatures.map((feature, index) => (
              <Alert key={index}>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>{feature.feature}</AlertTitle>
                <AlertDescription>{feature.reasoning}</AlertDescription>
              </Alert>
            ))}
          </div>

          <div className="text-center mb-8">
             <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
             <p className="text-muted-foreground">We found these properties that match your dream vibe.</p>
          </div>

          {result.matchedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.matchedProperties.map(property => (
                    <div key={property.id} className="flex flex-col gap-2">
                        <PropertyCard property={{...property, createdAt: null, featured: false, sellerName: ''}} />
                        <Alert variant="default" className="bg-primary/5 border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <AlertTitle className="text-primary">Why it's a match</AlertTitle>
                            <AlertDescription>{property.matchReason}</AlertDescription>
                        </Alert>
                    </div>
                ))}
            </div>
          ) : (
             <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                <Home className="mx-auto h-12 w-12 mb-4" />
                <p className="font-semibold text-lg">No exact matches found right now.</p>
                <p className="text-sm">Try describing your dream home differently, or check back later as new properties are added daily!</p>
                <Button asChild className="mt-4">
                    <Link href="/list-property">List a Property</Link>
                </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
