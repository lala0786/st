
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useState, useEffect, type FormEvent, useRef } from "react"
import Image from "next/image"
import { Loader2, UploadCloud, X, FileImage } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { uploadPropertyAction } from "@/actions/property"

// अधिकतम फोटो और फ़ाइल आकार के लिए स्थिरांक
const MAX_PHOTOS = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PostPropertyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // फॉर्म फ़ील्ड के लिए स्टेट
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // उपयोगकर्ता की प्रमाणीकरण स्थिति की जाँच के लिए हुक
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("[क्लाइंट] उपयोगकर्ता प्रमाणित:", currentUser.uid);
      } else {
        toast({ title: "कृपया लॉगिन करें", description: "संपत्ति सूचीबद्ध करने के लिए आपको लॉग इन होना आवश्यक है।", variant: "destructive" });
        router.push("/login");
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, [router, toast]);


  // फोटो चयन और सत्यापन को संभालने वाला फ़ंक्शन
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      console.log("[क्लाइंट] फ़ाइलें चयनित:", filesArray.map(f => f.name));

      // फोटो की अधिकतम संख्या की जाँच करें
      if (filesArray.length + photos.length > MAX_PHOTOS) {
        toast({
          title: "बहुत अधिक तस्वीरें",
          description: `आप अधिकतम ${MAX_PHOTOS} तस्वीरें अपलोड कर सकते हैं।`,
          variant: "destructive"
        });
        return;
      }

      // प्रत्येक फ़ाइल को मान्य करें
      const validFiles = filesArray.filter(file => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast({
              title: "अमान्य फ़ाइल प्रकार",
              description: `${file.name} एक अमान्य फ़ाइल प्रकार है। केवल JPG, PNG, और WebP की अनुमति है।`,
              variant: "destructive"
            });
            return false;
        }
        if(file.size > MAX_FILE_SIZE_BYTES) {
            toast({
              title: "फ़ाइल बहुत बड़ी है",
              description: `${file.name} ने ${MAX_FILE_SIZE_MB}MB आकार की सीमा को पार कर लिया है और इसे नहीं जोड़ा गया।`,
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

  // चयनित फोटो को हटाने का फ़ंक्शन
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
        const newPreviews = prev.filter((_, i) => i !== index);
        // ऑब्जेक्ट URL को मेमोरी से हटाने के लिए
        URL.revokeObjectURL(prev[index]);
        return newPreviews;
    });
  }
  
  // फॉर्म जमा करने का हैंडलर
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(10); // प्रगति शुरू करें

    if (!user) {
        toast({ title: "त्रुटि", description: "आपको लॉग इन होना चाहिए।", variant: "destructive" });
        setSubmitting(false);
        return;
    }

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    if (photos.length === 0) {
        toast({ title: "त्रुटि", description: "कम से कम एक फोटो आवश्यक है।", variant: "destructive" });
        setSubmitting(false);
        return;
    }
     if (!formValues.title || !formValues.propertyType || !formValues.listingType || !formValues.price || !formValues.area || !formValues.location || !formValues.description) {
        toast({ title: "त्रुटि", description: "कृपया सभी आवश्यक फ़ील्ड भरें।", variant: "destructive" });
        setSubmitting(false);
        return;
    }
    
    try {
        console.log("[क्लाइंट] जमा करने की तैयारी। ID टोकन प्राप्त हो रहा है...");
        const idToken = await user.getIdToken();
        formData.append('idToken', idToken);
        console.log("[क्लाइंट] टोकन प्राप्त हुआ। FormData में फ़ाइलें जोड़ी जा रही हैं...");
        
        photos.forEach(file => {
            formData.append("files", file);
        });
        
        console.log("[क्लाइंट] सर्वर एक्शन 'uploadPropertyAction' को कॉल किया जा रहा है...");
        setUploadProgress(50); // प्रगति अपडेट करें
        
        // सर्वर एक्शन को कॉल करें
        const result = await uploadPropertyAction(formData);
        
        setUploadProgress(100); // प्रगति पूरी करें

        if (result.success && result.propertyId) {
            console.log("[क्लाइंट] सर्वर एक्शन सफल। संपत्ति आईडी:", result.propertyId);
            toast({
                title: "संपत्ति सूचीबद्ध!",
                description: "आपकी संपत्ति सफलतापूर्वक जमा कर दी गई है।",
            });
            router.push(`/listing/${result.propertyId}`);
        } else {
            console.error("[क्लाइंट] सर्वर एक्शन विफल:", result.error);
            throw new Error(result.error || "सर्वर पर एक अज्ञात त्रुटि हुई।");
        }
    } catch (error) {
        console.error("[क्लाइंट] संपत्ति जमा करने के दौरान त्रुटि:", error);
        toast({
            title: "जमा करना विफल",
            description: (error instanceof Error) ? error.message : "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।",
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
          <CardTitle className="text-3xl">एक नई संपत्ति पोस्ट करें</CardTitle>
          <CardDescription>अपनी संपत्ति को सूचीबद्ध करने के लिए नीचे दिए गए विवरण भरें।</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              <div>
                  <Label htmlFor="title">संपत्ति का शीर्षक</Label>
                  <Input id="title" name="title" placeholder="उदा., शहर के दृश्य के साथ सुंदर 2BHK अपार्टमेंट" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label>संपत्ति का प्रकार</Label>
                  <Select name="propertyType" required defaultValue="Apartment">
                    <SelectTrigger><SelectValue placeholder="एक संपत्ति प्रकार चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">अपार्टमेंट / फ्लैट</SelectItem>
                      <SelectItem value="House">मकान / विला</SelectItem>
                      <SelectItem value="Plot">प्लॉट</SelectItem>
                      <SelectItem value="Shop">व्यावसायिक दुकान</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>सूचीबद्ध करने के लिए</Label>
                  <RadioGroup name="listingType" defaultValue="Sell" className="flex items-center gap-6 pt-2">
                      <div className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="Sell" id="sell"/>
                        <Label htmlFor="sell" className="font-normal">बिक्री</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem value="Rent" id="rent"/>
                        <Label htmlFor="rent" className="font-normal">किराया</Label>
                      </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div><Label htmlFor="price">कीमत (₹ में)</Label><Input id="price" name="price" type="number" placeholder="उदा., 4500000" required /></div>
                 <div><Label htmlFor="area">क्षेत्र (वर्ग फुट में)</Label><Input id="area" name="area" type="number" placeholder="उदा., 1200" required/></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div><Label htmlFor="bedrooms">बेडरूम</Label><Input id="bedrooms" name="bedrooms" type="number" min="0" defaultValue="0" required/></div>
                 <div><Label htmlFor="bathrooms">बाथरूम</Label><Input id="bathrooms" name="bathrooms" type="number" min="0" defaultValue="0" required/></div>
              </div>
              <div><Label htmlFor="location">स्थान / पता</Label><Input id="location" name="location" placeholder="पूरा पता, लैंडमार्क, या शहर दर्ज करें" required/></div>
              <div><Label htmlFor="description">संपत्ति का विवरण</Label><Textarea id="description" name="description" placeholder="अपनी संपत्ति का विस्तार से वर्णन करें..." className="min-h-[120px]" required/></div>

               <div>
                <Label>संपत्ति की तस्वीरें (आवश्यक, अधिकतम {MAX_PHOTOS})</Label>
                  <div className="mt-2">
                    <label htmlFor="photo-upload" className="block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">अपलोड करने के लिए क्लिक करें</span> या खींचें और छोड़ें
                        </p>
                        <p className="text-xs text-muted-foreground">{`अधिकतम ${MAX_PHOTOS} तस्वीरें (JPG, PNG, WebP), प्रत्येक अधिकतम ${MAX_FILE_SIZE_MB}MB`}</p>
                        <Input 
                            ref={fileInputRef}
                            id="photo-upload" 
                            type="file" 
                            className="hidden" 
                            multiple 
                            disabled={submitting}
                            onChange={handlePhotoChange}
                            accept={ALLOWED_FILE_TYPES.join(",")}
                        />
                    </label>
                  </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {photoPreviews.map((src, index) => (
                        <div key={src} className="relative aspect-square group">
                            <Image src={src} alt={`पूर्वावलोकन ${index + 1}`} fill className="object-cover rounded-md" />
                            <button type="button" onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                       <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                        <FileImage className="h-8 w-8" />
                        <span className="text-xs mt-1">और जोड़ें</span>
                       </button>
                    )}
                </div>
               </div>
                 {submitting && (
                   <div className="space-y-2">
                       <div className="flex justify-between items-center">
                           <span className="text-sm font-medium text-primary">आपकी संपत्ति जमा की जा रही है... कृपया प्रतीक्षा करें।</span>
                           <span className="text-sm font-bold text-primary">{uploadProgress}%</span>
                       </div>
                       <Progress value={uploadProgress} className="w-full h-2" />
                   </div>
                 )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting || !user} className="w-full">
                {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> जमा हो रहा है...</>
                ) : (
                    'संपत्ति जमा करें'
                )}
              </Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  )
}
