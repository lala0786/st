"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, UploadCloud } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth, db, storage } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { addDoc, collection } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters.").max(100),
  propertyType: z.enum(["Apartment", "House", "Plot", "Shop"], { required_error: "Please select a property type." }),
  listingType: z.enum(["Sell", "Rent"], { required_error: "Please select a listing type." }),
  price: z.coerce.number().min(1, "Price must be a positive number."),
  area: z.coerce.number().min(1, "Area must be a positive number."),
  bedrooms: z.coerce.number().min(0, "Bedrooms cannot be negative.").max(20),
  bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative.").max(20),
  location: z.string().min(5, "Location is required. Please be specific."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(1000),
  photos: z.custom<FileList>().refine((files) => files?.length > 0, "At least one photo is required.")
    .refine((files) => files?.length <= MAX_PHOTOS, `You can upload a maximum of ${MAX_PHOTOS} photos.`)
    .refine((files) => Array.from(files).every(file => file.size <= MAX_FILE_SIZE), `Each file must be less than 5MB.`),
})

export default function PostPropertyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedrooms: 0,
      bathrooms: 0,
    },
  })

  const uploadPhotos = async (photos: FileList): Promise<string[]> => {
    if (!storage || !user) throw new Error("Firebase not configured or user not logged in.");
    
    const photoURLs: string[] = [];
    for (const photo of Array.from(photos)) {
      const photoRef = ref(storage, `properties/${user.uid}/${Date.now()}-${photo.name}`);
      await uploadBytes(photoRef, photo);
      const url = await getDownloadURL(photoRef);
      photoURLs.push(url);
    }
    return photoURLs;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db || !user) {
        toast({ title: "Error", description: "Could not connect to the database.", variant: "destructive" });
        return;
    }
    setSubmitting(true);
    try {
        // 1. Upload photos to Firebase Storage
        const imageUrls = await uploadPhotos(values.photos);

        // 2. Save property data to Firestore
        await addDoc(collection(db, "properties"), {
            ...values,
            photos: imageUrls, // Store URLs instead of FileList
            sellerId: user.uid,
            sellerName: user.displayName,
            sellerEmail: user.email,
            createdAt: new Date(),
            featured: false, // Default value
        });

        toast({
            title: "Property Listed!",
            description: "Your property has been successfully submitted.",
        });
        form.reset();
        setPhotoPreviews([]);
        router.push("/"); // Redirect to homepage after successful submission

    } catch (error) {
        console.error("Error listing property:", error);
        toast({
            title: "Submission Failed",
            description: "An error occurred while listing your property. Please try again.",
            variant: "destructive"
        });
    } finally {
        setSubmitting(false);
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length > MAX_PHOTOS) {
        toast({
          title: "Too many photos",
          description: `You can upload a maximum of ${MAX_PHOTOS} photos.`,
          variant: "destructive"
        })
        return;
      }
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotoPreviews(newPreviews);
      form.setValue("photos", files);
    }
  };
  
  if (loading) {
    return <div className="container mx-auto flex justify-center py-12"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-3xl">
        <Form {...form}>
          <CardHeader>
            <CardTitle className="text-3xl">Post a new Property</CardTitle>
            <CardDescription>Fill in the details below to list your property.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                      <Input placeholder="e.g., Beautiful 2BHK Apartment with city view" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Apartment">Apartment / Flat</SelectItem>
                          <SelectItem value="House">House / Villa</SelectItem>
                          <SelectItem value="Plot">Plot</SelectItem>
                          <SelectItem value="Shop">Commercial Shop</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Listing For</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center gap-6"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Sell" />
                            </FormControl>
                            <FormLabel className="font-normal">Sale</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Rent" />
                            </FormControl>
                            <FormLabel className="font-normal">Rent</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price (in ₹)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 4500000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area (in sq. ft.)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 1200" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                        <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                        <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full address, landmark, or city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your property in detail..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Photos</FormLabel>
                     <FormControl>
                        <label htmlFor="photo-upload" className="block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                            {photoPreviews.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {photoPreviews.map((src, index) => (
                                        <div key={index} className="relative aspect-square">
                                            <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">Up to {MAX_PHOTOS} photos (PNG, JPG, max 5MB each)</p>
                                </>
                            )}
                            <Input 
                                id="photo-upload" 
                                type="file" 
                                className="hidden"
                                onChange={handlePhotoChange} 
                                accept="image/png, image/jpeg" 
                                multiple 
                            />
                        </label>
                    </FormControl>
                    <FormDescription>
                      Good photos attract more buyers. Upload clear, bright pictures.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
                />

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                   "Submit Property"
                )}
              </Button>
            </form>
          </CardContent>
        </Form>
      </Card>
    </div>
  )
}
