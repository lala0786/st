"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, Wand2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { designInterior, InteriorDesignerOutput } from '@/ai/flows/interior-designer-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const designStyles = ["Modern", "Minimalist", "Industrial", "Bohemian", "Scandinavian", "Traditional", "Farmhouse"];

export default function InteriorDesignerPage() {
  const [originalPhoto, setOriginalPhoto] = useState<File | null>(null);
  const [originalPhotoPreview, setOriginalPhotoPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Make this room look more spacious and brighter.');
  const [style, setStyle] = useState<string>('Modern');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InteriorDesignerOutput | null>(null);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setOriginalPhoto(file);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalPhotoPreview(reader.result as string);
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
    if (!originalPhoto) {
      toast({
        title: 'Missing Photo',
        description: 'Please upload a photo of the room you want to redesign.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const photoDataUri = await fileToDataUri(originalPhoto);
      const response = await designInterior({ photoDataUri, style, prompt });
      setResult(response);
    } catch (error) {
      console.error('Error designing interior:', error);
      toast({
        title: 'Error',
        description: 'Could not generate design. The model may be unavailable. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
                    <Wand2 className="text-primary" /> AI Interior Designer
                </CardTitle>
                <CardDescription>
                    Redesign any room in seconds. Upload a photo and let our AI work its magic.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                        <Label htmlFor="photo-upload">Original Room Photo</Label>
                        <label htmlFor="photo-upload" className="block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors aspect-video flex items-center justify-center">
                        {originalPhotoPreview ? (
                            <Image src={originalPhotoPreview} alt="Original room" width={400} height={250} className="mx-auto rounded-md object-contain max-h-full" />
                        ) : (
                            <div className="text-muted-foreground">
                                <UploadCloud className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">
                                <span className="font-semibold text-primary">Click to upload</span> a photo
                                </p>
                            </div>
                        )}
                        <Input id="photo-upload" type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                        </label>
                    </div>
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="style">Design Style</Label>
                             <Select onValueChange={setStyle} defaultValue={style}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a design style" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prompt">Instructions</Label>
                            <Textarea
                            id="prompt"
                            placeholder="e.g., Add more natural light, use a blue color palette..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="resize-y min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-8">
                    <Button type="submit" disabled={loading || !originalPhoto} size="lg" className="w-full max-w-sm">
                        {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Design...
                        </>
                        ) : (
                        '✨ Redesign with AI'
                        )}
                    </Button>

                    {loading && (
                        <div className="text-center text-muted-foreground">
                            <p>Analyzing and redesigning your space... This may take a moment.</p>
                        </div>
                    )}
                    
                    {result && (
                        <div className='w-full text-center'>
                             <CardTitle className="mb-4">Your New Design</CardTitle>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                 <div className="relative aspect-video rounded-lg overflow-hidden border">
                                     <Image src={originalPhotoPreview!} alt="Original Room" fill className="object-contain"/>
                                     <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Original</div>
                                 </div>
                                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary">
                                    <Image src={result.imageDataUri} alt="AI Designed Room" fill className="object-contain" />
                                     <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">AI Design</div>
                                </div>
                             </div>
                              <Button onClick={(e) => handleSubmit(e)} variant="outline" className="mt-6">
                                <RefreshCw className="mr-2 h-4 w-4"/>
                                Regenerate
                            </Button>
                        </div>
                    )}

                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
