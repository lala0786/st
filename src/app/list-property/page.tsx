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
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { uploadPropertyAction } from "@/actions/property"

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

  // State for form fields
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
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
      console.log("[Client] Files selected:", filesArray.map(f => f.name));

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
    setSubmitting(true);
    setUploadProgress(10);

    if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        setSubmitting(false);
        return;
    }

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    if (photos.length === 0) {
        toast({ title: "Error", description: "At least one photo is required.", variant: "destructive" });
        setSubmitting(false);
        return;
    }
     if (!formValues.title || !formValues.propertyType || !formValues.listingType || !formValues.price || !formValues.area || !formValues.location || !formValues.description) {
        toast({ title: "Error", description: "Please fill out all required fields.", variant: "destructive" });
        setSubmitting(false);
        return;
    }
    
    try {
        console.log("[Client] Preparing to submit. Getting ID token...");
        const idToken = await user.getIdToken();
        formData.append('idToken', idToken);
        console.log("[Client] Token retrieved. Appending files to FormData...");
        
        photos.forEach(file => {
            formData.append("files", file);
        });
        
        console.log("[Client] Calling server action 'uploadPropertyAction'...");
        setUploadProgress(50);
        
        const result = await uploadPropertyAction(formData);
        
        setUploadProgress(100);

        if (result.success && result.propertyId) {
            console.log("[Client] Server action successful. Property ID:", result.propertyId);
            toast({
                title: "Property Listed!",
                description: "Your property has been successfully submitted.",
            });
            router.push(`/listing/${result.propertyId}`);
        } else {
            console.error("[Client] Server action failed:", result.error);
            throw new Error(result.error || "An unknown error occurred on the server.");
        }
    } catch (error) {
        console.error("[Client] Error during property submission:", error);
        toast({
            title: "Submission Failed",
            description: (error instanceof Error) ? error.message : "An unexpected error occurred. Please try again.",
            variant: "destructive"
        });
    } finally {
        setSubmitting(false);
        setUploadProgress(0);
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
                  <Input id="title" name="title" placeholder="e.g., Beautiful 2BHK Apartment with city view" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label>Property Type</Label>
                  <Select name="propertyType" required defaultValue="Apartment">
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
                  <RadioGroup name="listingType" defaultValue="Sell" className="flex items-center gap-6 pt-2">
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
                 <div><Label htmlFor="price">Price (in ₹)</Label><Input id="price" name="price" type="number" placeholder="e.g., 4500000" required /></div>
                 <div><Label htmlFor="area">Area (in sq. ft.)</Label><Input id="area" name="area" type="number" placeholder="e.g., 1200" required/></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div><Label htmlFor="bedrooms">Bedrooms</Label><Input id="bedrooms" name="bedrooms" type="number" min="0" defaultValue="0" required/></div>
                 <div><Label htmlFor="bathrooms">Bathrooms</Label><Input id="bathrooms" name="bathrooms" type="number" min="0" defaultValue="0" required/></div>
              </div>
              <div><Label htmlFor="location">Location / Address</Label><Input id="location" name="location" placeholder="Enter full address, landmark, or city" required/></div>
              <div><Label htmlFor="description">Property Description</Label><Textarea id="description" name="description" placeholder="Describe your property in detail..." className="min-h-[120px]" required/></div>

               <div>
                <Label>Property Photos (Required, Max {MAX_PHOTOS})</Label>
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
                        <div key={src} className="relative aspect-square">
                            <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover rounded-md" onLoad={() => URL.revokeObjectURL(src)} />
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
              <Button type="submit" disabled={submitting || !user} className="w-full">
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