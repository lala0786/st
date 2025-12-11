"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useState, useEffect, type FormEvent } from "react"
import Image from "next/image"
import { Loader2, UploadCloud, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { addDoc, collection } from "firebase/firestore"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function PostPropertyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  // Use simple state for form fields
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        toast({ title: "Please login", description: "You need to be logged in to list a property.", variant: "destructive" });
        router.push("/login");
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, [router, toast]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      console.log("[Client] Files selected:", filesArray);

      if (filesArray.length + photos.length > MAX_PHOTOS) {
        toast({
          title: "Too many photos",
          description: `You can upload a maximum of ${MAX_PHOTOS} photos.`,
          variant: "destructive"
        });
        return;
      }

      const validFiles = filesArray.filter(file => {
        if(file.size > MAX_FILE_SIZE_BYTES) {
            toast({
              title: "File too large",
              description: `${file.name} exceeded the ${MAX_FILE_SIZE_MB}MB size limit and was not added.`,
              variant: "destructive"
            });
            return false;
        }
        return true;
      });

      setPhotos(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  }
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    if (photos.length === 0) {
        toast({ title: "Error", description: "At least one photo is required.", variant: "destructive" });
        return;
    }
    if (!title || !propertyType || !listingType || !price || !area || !location || !description) {
        toast({ title: "Error", description: "Please fill out all required fields.", variant: "destructive" });
        return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
        // Step 1: Upload images to the server via API route
        const formData = new FormData();
        photos.forEach(file => {
            formData.append("files", file);
        });

        console.log("[Client] Uploading files to API route...");
        setUploadProgress(50); // Set progress to 50% to indicate upload has started

        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || 'Image upload failed on the server.');
        }
        
        const { urls: imageUrls } = await uploadResponse.json();
        console.log("[Client] Received image URLs:", imageUrls);
        setUploadProgress(100);

        if (!imageUrls || imageUrls.length === 0) {
          throw new Error("Server did not return any image URLs.");
        }

        // Step 2: Save property data with image URLs to Firestore
        console.log("[Client] Saving property to Firestore with URLs...", imageUrls);
        await addDoc(collection(db, "properties"), {
            title,
            propertyType,
            listingType,
            price: Number(price),
            area: Number(area),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            location,
            description,
            photos: imageUrls,
            sellerId: user.uid,
            sellerName: user.displayName || user.email,
            sellerEmail: user.email,
            createdAt: new Date(),
            featured: false,
        });

        toast({
            title: "Property Listed!",
            description: "Your property has been successfully submitted.",
        });
        
        router.push("/");

    } catch (error) {
        console.error("[Client] Error listing property:", error);
        toast({
            title: "Submission Failed",
            description: (error instanceof Error) ? error.message : "An unexpected error occurred. Please try again.",
            variant: "destructive"
        });
    } finally {
        setSubmitting(false);
    }
  }

  if (loadingUser) {
    return (
      <div className="container mx-auto flex justify-center py-12">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl">Post a new Property</CardTitle>
          <CardDescription>Fill in the details below to list your property.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              <div>
                  <Label htmlFor="title">Property Title</Label>
                  <Input id="title" placeholder="e.g., Beautiful 2BHK Apartment with city view" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label>Property Type</Label>
                  <Select onValueChange={setPropertyType} value={propertyType} required>
                    <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment / Flat</SelectItem>
                      <SelectItem value="House">House / Villa</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Shop">Commercial Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Listing For</Label>
                  <RadioGroup onValueChange={setListingType} value={listingType} className="flex items-center gap-6 pt-2">
                      <div className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="Sell" id="sell"/>
                        <Label htmlFor="sell" className="font-normal">Sale</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="Rent" id="rent"/>
                        <Label htmlFor="rent" className="font-normal">Rent</Label>
                      </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div><Label htmlFor="price">Price (in ₹)</Label><Input id="price" type="number" placeholder="e.g., 4500000" value={price} onChange={e => setPrice(e.target.value)} required /></div>
                 <div><Label htmlFor="area">Area (in sq. ft.)</Label><Input id="area" type="number" placeholder="e.g., 1200" value={area} onChange={e => setArea(e.target.value)} required/></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div><Label htmlFor="bedrooms">Bedrooms</Label><Input id="bedrooms" type="number" min="0" value={bedrooms} onChange={e => setBedrooms(e.target.value)} required/></div>
                 <div><Label htmlFor="bathrooms">Bathrooms</Label><Input id="bathrooms" type="number" min="0" value={bathrooms} onChange={e => setBathrooms(e.target.value)} required/></div>
              </div>
              <div><Label htmlFor="location">Location / Address</Label><Input id="location" placeholder="Enter full address, landmark, or city" value={location} onChange={e => setLocation(e.target.value)} required/></div>
              <div><Label htmlFor="description">Property Description</Label><Textarea id="description" placeholder="Describe your property in detail..." className="min-h-[120px]" value={description} onChange={e => setDescription(e.target.value)} required/></div>

               <div>
                <Label>Property Photos (Required)</Label>
                  <div className="mt-2">
                    <label htmlFor="photo-upload" className="block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">Up to {MAX_PHOTOS} photos (PNG, JPG, max {MAX_FILE_SIZE_MB}MB each)</p>
                        <Input 
                            id="photo-upload" 
                            type="file" 
                            className="hidden" 
                            multiple 
                            disabled={submitting}
                            onChange={handlePhotoChange}
                            accept="image/png, image/jpeg, image/webp"
                        />
                    </label>
                  </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {photoPreviews.map((src, index) => (
                        <div key={index} className="relative aspect-square">
                            <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover rounded-md" />
                            <button type="button" onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
               </div>
                 {submitting && (
                   <div className="space-y-2">
                       <div className="flex justify-between items-center">
                           <span className="text-sm font-medium text-primary">Submitting your property... Please wait.</span>
                           <span className="text-sm font-bold text-primary">{uploadProgress}%</span>
                       </div>
                       <Progress value={uploadProgress} className="w-full h-2" />
                   </div>
                 )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                    'Submit Property'
                )}
              </Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  )
}
