"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { UploadCloud, X } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const amenitiesList = [
  { id: "parking", label: "Car Parking" },
  { id: "lift", label: "Lift" },
  { id: "power_backup", label: "Power Backup" },
  { id: "security", label: "24/7 Security" },
  { id: "garden", label: "Garden / Park" },
  { id: "pool", label: "Swimming Pool" },
]

const formSchema = z.object({
  listerType: z.enum(["Owner", "Broker", "Builder"], { required_error: "Please specify who you are." }),
  propertyType: z.enum(["Apartment", "House", "Plot", "Shop"], { required_error: "You need to select a property type."}),
  transaction: z.enum(["Sell", "Rent"], { required_error: "You need to select a transaction type."}),
  location: z.string().min(5, "Location is required"),
  price: z.coerce.number().min(1, "Price must be a positive number"),
  area: z.coerce.number().min(1, "Area must be a positive number"),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  description: z.string().min(20, "Please provide a detailed description").max(500),
  photos: z.any(),
  amenities: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one amenity.",
  }),
  contactName: z.string().min(2, "Contact name is required"),
  contactPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
})

export default function ListPropertyPage() {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listerType: "Owner",
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
    },
  })

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
      if (event.target.files) {
        const files = Array.from(event.target.files);
        if (imagePreviews.length + files.length > 10) {
            toast({
                title: "Upload Limit Exceeded",
                description: "You can upload a maximum of 10 photos.",
                variant: "destructive",
            });
            return;
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }
  }
  
  function removeImage(index: number) {
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
        title: "Listing Submitted!",
        description: "Your property has been listed for review. Thank you!",
        variant: "default",
        style: {
          backgroundColor: 'hsl(var(--accent))',
          color: 'hsl(var(--accent-foreground))',
          borderColor: 'hsl(var(--accent))'
        }
    });
    form.reset();
    setImagePreviews([]);
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">List Your Property</CardTitle>
          <CardDescription>Fill out the form below to get your property listed on our platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="listerType" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel className="text-lg font-semibold">You are a...</FormLabel>
                    <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-4">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Owner" /></FormControl>
                            <FormLabel className="font-normal">Owner</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Broker" /></FormControl>
                            <FormLabel className="font-normal">Broker / Agent</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Builder" /></FormControl>
                            <FormLabel className="font-normal">Builder</FormLabel>
                        </FormItem>
                    </RadioGroup></FormControl><FormMessage /></FormItem>
              )}/>

              <FormField control={form.control} name="propertyType" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel className="text-lg font-semibold">Property Type</FormLabel>
                    <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-4">
                        {["Apartment", "House", "Plot", "Shop"].map(type => (
                            <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={type} /></FormControl>
                                <FormLabel className="font-normal">{type}</FormLabel>
                            </FormItem>
                        ))}</RadioGroup></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="transaction" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel className="text-lg font-semibold">Transaction Type</FormLabel>
                    <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Sell" /></FormControl><FormLabel className="font-normal">Sell</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Rent" /></FormControl><FormLabel className="font-normal">Rent</FormLabel></FormItem>
                    </RadioGroup></FormControl><FormMessage /></FormItem>
              )}/>
              
              <div className="grid md:grid-cols-2 gap-8">
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location / Address</FormLabel><FormControl><Input placeholder="e.g. Sector 1, Pithampur" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (in INR)</FormLabel><FormControl><Input type="number" placeholder="e.g. 4500000" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 <FormField control={form.control} name="area" render={({ field }) => (<FormItem><FormLabel>Area (in sqft)</FormLabel><FormControl><Input type="number" placeholder="e.g. 1500" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                 <FormField control={form.control} name="bedrooms" render={({ field }) => (<FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                 <FormField control={form.control} name="bathrooms" render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Tell us more about your property..." className="resize-y min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              
              <FormField control={form.control} name="amenities" render={() => (
                  <FormItem><div className="mb-4"><FormLabel className="text-lg font-semibold">Amenities</FormLabel></div><div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesList.map((item) => (<FormField key={item.id} control={form.control} name="amenities"
                        render={({ field }) => {
                          return (<FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                    return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                                  }}/></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>)
                        }}/>
                    ))}<FormMessage /></div></FormItem>
                )}/>

              <FormItem>
                <FormLabel className="text-lg font-semibold">Property Photos (up to 10)</FormLabel>
                <FormControl>
                    <label htmlFor="photo-upload" className="block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <Input type="file" multiple className="hidden" id="photo-upload" onChange={handleImageChange} accept="image/*" />
                    </label>
                </FormControl>
                 <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {imagePreviews.map((src, index) => (
                        <div key={src} className="relative group">
                            <Image src={src} alt={`Preview ${index}`} width={150} height={100} className="w-full h-24 object-cover rounded-md" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                                <X className="h-4 w-4" /><span className="sr-only">Remove image</span>
                            </Button>
                        </div>
                    ))}
                 </div>
                <FormMessage />
              </FormItem>
              
              <div className="space-y-4 pt-4 border-t">
                 <h3 className="text-lg font-semibold">Contact Information</h3>
                 <div className="grid md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="contactName" render={({ field }) => (<FormItem><FormLabel>Contact Person Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input type="tel" placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                 </div>
              </div>


              <Button type="submit" size="lg" className="w-full">Review & Submit Listing</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
