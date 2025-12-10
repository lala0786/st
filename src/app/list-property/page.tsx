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
import { Loader2, UploadCloud, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth, db, storage } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { addDoc, collection } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, type UploadTaskSnapshot } from "firebase/storage"
import { Progress } from "@/components/ui/progress"

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
  photos: z.any().refine((files) => files?.length > 0, "At least one photo is required.")
    .refine((files) => files?.length <= MAX_PHOTOS, `You can upload a maximum of ${MAX_PHOTOS} photos.`)
    .refine((files) => !files || Array.from(files).every((file: any) => file.size <= MAX_FILE_SIZE), `Each file must be less than 5MB.`),
})

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 'Step 1', name: 'Basic Information', fields: ['title', 'propertyType', 'listingType', 'price', 'area'] },
  { id: 'Step 2', name: 'Property Details', fields: ['bedrooms', 'bathrooms', 'location', 'description'] },
  { id: 'Step 3', name: 'Photos', fields: ['photos'] },
]

export default function PostPropertyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
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
    },
     mode: "onBlur"
  })

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Failed to get canvas context'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('Canvas to Blob conversion failed'));
              }
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  
  const uploadPhotos = async (photos: FileList): Promise<string[]> => {
      if (!storage || !user) {
        throw new Error("Firebase not configured or user not logged in.");
      }
      
      const photoFiles = Array.from(photos);
      
      setSubmissionStatus('Compressing images...');
      const compressedFiles = await Promise.all(photoFiles.map(compressImage));

      setSubmissionStatus('Uploading images...');
      setUploadProgress(0);

      const fileProgress: { [key: string]: { transferred: number; total: number } } = {};
      const totalSize = compressedFiles.reduce((acc, file) => acc + file.size, 0);

      const uploadPromises = compressedFiles.map(photo => {
        return new Promise<string>((resolveFile, rejectFile) => {
          const photoRef = ref(storage, `properties/${user.uid}/${Date.now()}-${photo.name}`);
          const uploadTask = uploadBytesResumable(photoRef, photo);

          uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
              fileProgress[photo.name] = { transferred: snapshot.bytesTransferred, total: snapshot.totalBytes };
              const totalTransferred = Object.values(fileProgress).reduce((acc, { transferred }) => acc + transferred, 0);
              setUploadProgress(Math.round((totalTransferred / totalSize) * 100));
            },
            (error) => {
              console.error(`Upload failed for ${photo.name}:`, error);
              rejectFile(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolveFile(url);
            }
          );
        });
      });

      return Promise.all(uploadPromises);
  }

  
  const processForm = async (values: FormValues) => {
     if (!db || !user) {
        toast({ title: "Error", description: "Could not connect to the database.", variant: "destructive" });
        return;
    }
    setSubmitting(true);
    try {
        const imageUrls = await uploadPhotos(values.photos);
        setSubmissionStatus('Finalizing...');
        await addDoc(collection(db, "properties"), {
            ...values,
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
        form.reset();
        setPhotoPreviews([]);
        setCurrentStep(0);
        router.push("/");

    } catch (error) {
        console.error("Error listing property:", error);
        toast({
            title: "Submission Failed",
            description: "An error occurred while listing your property. Please try again.",
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
      form.setValue("photos", files, { shouldValidate: true });
    }
  };

  type FieldName = keyof FormValues;

  const next = async () => {
    const fields = steps[currentStep].fields as FieldName[];
    const output = await form.trigger(fields, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
        setCurrentStep(step => step + 1);
    } else {
        await processForm(form.getValues());
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
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
          <CardDescription>Follow the steps to list your property with us.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-8">
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Step {currentStep + 1} of {steps.length}</span>
                     {submitting && <span className="text-sm font-medium text-primary">{submissionStatus}</span>}
                 </div>
                 <Progress value={submitting ? uploadProgress : ((currentStep + 1) / steps.length) * 100} className="w-full h-2" />
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(processForm)}>
                {currentStep === 0 && (
                  <div className="space-y-8">
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
                  </div>
                )}

                {currentStep === 1 && (
                   <div className="space-y-8">
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
                   </div>
                )}
                
                {currentStep === 2 && (
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
                                  <Input id="photo-upload" type="file" className="hidden" onChange={handlePhotoChange} accept="image/png, image/jpeg" multiple disabled={submitting} />
                              </label>
                          </FormControl>
                          <FormDescription>Good photos attract more buyers. Upload clear, bright pictures.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                      />
                )}
              </form>
            </Form>
          </div>
        </CardContent>
         <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prev} disabled={currentStep === 0 || submitting}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button type="button" onClick={next} disabled={submitting}>
                {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {submissionStatus} {uploadProgress > 0 && `(${uploadProgress}%)`}</>
                ) : (
                    currentStep === steps.length - 1 ? 'Submit Property' : 'Next'
                )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
