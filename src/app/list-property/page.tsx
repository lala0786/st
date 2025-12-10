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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, UploadCloud } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth, db, storage } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { addDoc, collection } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { Progress } from "@/components/ui/progress"

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  photos: z.instanceof(FileList)
    .refine((files) => files?.length > 0, "At least one photo is required.")
    .refine((files) => files?.length <= MAX_PHOTOS, `You can upload a maximum of ${MAX_PHOTOS} photos.`)
    .refine((files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE_BYTES), `Each file must be less than ${MAX_FILE_SIZE_MB}MB.`),
})

type FormValues = z.infer<typeof formSchema>;

export default function PostPropertyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
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


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedrooms: 0,
      bathrooms: 0,
      title: "",
      location: "",
      description: "",
    },
     mode: "onBlur"
  })

  const uploadPhotos = (photos: FileList): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        if (!storage || !user) {
            return reject(new Error("Firebase not configured or user not logged in."));
        }

        const photoFiles = Array.from(photos);
        const downloadUrls: string[] = [];
        let filesUploaded = 0;
        let totalProgress = 0;

        setSubmissionStatus('Uploading images...');
        setUploadProgress(0);

        if (photoFiles.length === 0) {
            return resolve([]);
        }

        photoFiles.forEach((file, index) => {
            const photoRef = ref(storage, `properties/${user.uid}/${Date.now()}-${file.name}`);
            const uploadTask = uploadBytesResumable(photoRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    // This logic can be improved to show per-file progress if needed
                    // For now, we update total progress once a file is done.
                },
                (error) => {
                    console.error(`Upload failed for ${file.name}:`, error);
                    // Rejecting on first error
                    reject(new Error(`Failed to upload ${file.name}. Please try again.`));
                },
                async () => {
                    try {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        downloadUrls.push(url);
                        filesUploaded++;
                        totalProgress = (filesUploaded / photoFiles.length) * 100;
                        setUploadProgress(Math.round(totalProgress));
                        setSubmissionStatus(`Uploading... (${filesUploaded}/${photoFiles.length})`);

                        if (filesUploaded === photoFiles.length) {
                            resolve(downloadUrls);
                        }
                    } catch (error) {
                        console.error(`Failed to get download URL for ${file.name}:`, error);
                        reject(new Error(`Failed to get URL for ${file.name}.`));
                    }
                }
            );
        });
    });
  };
  
  const processForm = async (values: FormValues) => {
     if (!db || !user) {
        toast({ title: "Error", description: "Could not connect to the database.", variant: "destructive" });
        return;
    }
    setSubmitting(true);
    console.log("Form submitted with values: ", values);
    
    try {
        console.log("Starting photo upload...");
        const imageUrls = await uploadPhotos(values.photos);
        console.log("Photo upload complete. URLs: ", imageUrls);

        setSubmissionStatus('Finalizing...');
        setUploadProgress(100);

        const { photos, ...formData } = values;

        await addDoc(collection(db, "properties"), {
            ...formData,
            photos: imageUrls,
            sellerId: user.uid,
            sellerName: user.displayName,
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
        console.error("Error listing property:", error);
        toast({
            title: "Submission Failed",
            description: (error instanceof Error) ? error.message : "An error occurred. Please try again.",
            variant: "destructive"
        });
    } finally {
        setSubmitting(false);
        setUploadProgress(0);
        setSubmissionStatus('');
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Validate file count on change
      if (files.length > MAX_PHOTOS) {
        toast({
          title: "Too many photos",
          description: `You can upload a maximum of ${MAX_PHOTOS} photos.`,
          variant: "destructive"
        })
        e.target.value = ""; // Reset file input
        setPhotoPreviews([]);
        form.resetField("photos");
        return;
      }
      
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotoPreviews(newPreviews);
      form.setValue("photos", files, { shouldValidate: true });
    }
  };
  
  if (loading) {
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
         <Form {...form}>
          <form onSubmit={form.handleSubmit(processForm)}>
            <CardContent className="space-y-8">
              {/* Basic Information */}
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
                          <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
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
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-6">
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Sell" /></FormControl>
                            <FormLabel className="font-normal">Sale</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Rent" /></FormControl>
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
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price (in ₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4500000" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem><FormLabel>Area (in sq. ft.)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1200" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="bedrooms" render={({ field }) => (
                    <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                <FormField control={form.control} name="bathrooms" render={({ field }) => (
                    <FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location / Address</FormLabel><FormControl><Input placeholder="Enter full address, landmark, or city" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Property Description</FormLabel><FormControl><Textarea placeholder="Describe your property in detail..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

              {/* Photos */}
               <FormField
                control={form.control}
                name="photos"
                render={() => (
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
                                    <p className="text-xs text-muted-foreground">Up to {MAX_PHOTOS} photos (PNG, JPG, max {MAX_FILE_SIZE_MB}MB each)</p>
                                </>
                            )}
                            <Input 
                                id="photo-upload" 
                                type="file" 
                                className="hidden" 
                                multiple 
                                disabled={submitting}
                                {...form.register("photos")}
                                onChange={handlePhotoChange}
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </label>
                    </FormControl>
                    <FormDescription>Good photos attract more buyers. Upload clear, bright pictures.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
                />
                 {submitting && (
                   <div className="space-y-2">
                       <div className="flex justify-between items-center">
                           <span className="text-sm font-medium text-primary">{submissionStatus}</span>
                           <span className="text-sm font-bold text-primary">{uploadProgress}%</span>
                       </div>
                       <Progress value={uploadProgress} className="w-full h-2" />
                   </div>
                 )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting || !form.formState.isValid} className="w-full">
                {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {submissionStatus || 'Submitting...'}</>
                ) : (
                    'Submit Property'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
