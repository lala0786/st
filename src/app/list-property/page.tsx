"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import Image from "next/image"
import { UploadCloud } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  propertyType: z.enum(["Flat", "House", "Plot", "Commercial"], { required_error: "Please select a property type." }),
  listingType: z.enum(["Sell", "Rent"], { required_error: "Please select a listing type." }),
  location: z.string().min(5, "Location is required. Please be specific."),
  photos: z.custom<FileList>().refine((files) => files?.length > 0, "At least one photo is required."),
})

export default function PostPropertyPage() {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
        title: "Property Listed!",
        description: "Your property has been submitted for review.",
    })
    // Here you would handle the form submission, e.g., upload files and save data.
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length > 10) {
        toast({
          title: "Too many photos",
          description: "You can upload a maximum of 10 photos.",
          variant: "destructive"
        })
        return;
      }
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotoPreviews(newPreviews);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <Form {...form}>
          <CardHeader>
            <CardTitle>Post a new Property</CardTitle>
            <FormDescription>Fill in the details below to list your property.</FormDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <SelectItem value="Flat">Flat / Apartment</SelectItem>
                        <SelectItem value="House">House / Villa</SelectItem>
                        <SelectItem value="Plot">Plot</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
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
                    <FormLabel>Listing Type</FormLabel>
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
                          <FormLabel className="font-normal">For Sale</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Rent" />
                          </FormControl>
                          <FormLabel className="font-normal">For Rent</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter locality, landmark or city" {...field} />
                    </FormControl>
                    <FormDescription>
                      e.g., Sector 1, Near Sanjay Reservoir, Pithampur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photos"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Property Photos</FormLabel>
                     <FormControl>
                        <label htmlFor="photo-upload" className="block border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                            {photoPreviews.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                                    <p className="text-xs text-muted-foreground">Up to 10 photos (PNG, JPG)</p>
                                </>
                            )}
                            <Input 
                                id="photo-upload" 
                                type="file" 
                                className="hidden"
                                {...rest}
                                onChange={(e) => {
                                    handlePhotoChange(e);
                                    onChange(e.target.files);
                                }} 
                                accept="image/png, image/jpeg" 
                                multiple 
                            />
                        </label>
                    </FormControl>
                    <FormDescription>
                      Add beautiful photos of your property to attract more buyers or tenants.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
                />

              <Button type="submit" size="lg" className="w-full">
                Submit Property
              </Button>
            </form>
          </CardContent>
        </Form>
      </Card>
    </div>
  )
}
