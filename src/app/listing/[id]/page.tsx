"use client";

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
    BedDouble, Bath, AreaChart, MapPin, Phone, MessageCircle, CheckCircle, Car, Zap, Shield, Droplets, Flower2, Home, User
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const amenityIcons: { [key: string]: React.ReactNode } = {
    'Parking': <Car className="h-6 w-6 text-primary" />,
    'Power Backup': <Zap className="h-6 w-6 text-primary" />,
    'Security': <Shield className="h-6 w-6 text-primary" />,
    'Water Supply': <Droplets className="h-6 w-6 text-primary" />,
    'Garden': <Flower2 className="h-6 w-6 text-primary" />,
    'Lift': <Home className="h-6 w-6 text-primary" />,
    'Gated Community': <Shield className="h-6 w-6 text-primary" />,
    'Road': <MapPin className="h-6 w-6 text-primary" />,
    'Servant Quarters': <User className="h-6 w-6 text-primary" />,
    'Main Road Facing': <MapPin className="h-6 w-6 text-primary" />,
    'Private Pool': <Droplets className="h-6 w-6 text-primary" />,
    'Gym': <Zap className="h-6 w-6 text-primary" />,
    'Clubhouse': <Home className="h-6 w-6 text-primary" />,
  };


export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    async function getProperty(id: string) {
        if (!db) {
            setLoading(false);
            return;
        }
        try {
            const docRef = doc(db, "properties", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const fetchedProperty = { 
                    id: docSnap.id, 
                    ...data,
                    createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null
                } as Property;
                setProperty(fetchedProperty);
                if (fetchedProperty.photos && fetchedProperty.photos.length > 0) {
                    setSelectedImage(fetchedProperty.photos[0]);
                }
            } else {
                setProperty(null);
            }
        } catch (error) {
            console.error("Error fetching property: ", error);
            setProperty(null);
        } finally {
            setLoading(false);
        }
    }
    
    getProperty(params.id);

  }, [params.id]);


  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="w-full aspect-[16/10] rounded-lg" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full aspect-square rounded-md" />)}
            </div>
            <Skeleton className="w-full h-48 rounded-lg" />
            <Skeleton className="w-full h-32 rounded-lg" />
          </div>
          <div className="lg:col-span-1">
             <Skeleton className="w-full h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    notFound();
  }
  
  const propertyTypeHints: { [key: string]: string } = {
    Apartment: 'apartment interior',
    House: 'house interior',
    Plot: 'empty plot',
    Shop: 'shop interior',
  }
  
  const sellerPhone = property.sellerPhone || '+919999999999';

  const mapSrc = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(property.location)}`
    : '';

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            <div className="mb-8">
                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border mb-2">
                    {selectedImage && (
                        <Image
                            src={selectedImage}
                            alt={`${property.title} main image`}
                            width={800}
                            height={500}
                            className="w-full h-full object-cover"
                            data-ai-hint={propertyTypeHints[property.propertyType] || 'room interior'}
                            priority
                        />
                    )}
                </div>
                 <div className="grid grid-cols-5 gap-2">
                    {property.photos.map((img: string, index: number) => (
                      <button key={index} onClick={() => setSelectedImage(img)} className={`aspect-square rounded-md overflow-hidden border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}>
                        <Image
                          src={img}
                          alt={`${property.title} thumbnail ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                 </div>
            </div>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">{property.title}</CardTitle>
                    <CardDescription className="flex items-center pt-2">
                        <MapPin className="w-4 h-4 mr-1" /> {property.location}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline space-x-2">
                         <span className="text-4xl font-headline text-primary">{formatPrice(property.price)}</span>
                        {property.listingType === 'Rent' && <span className="text-lg text-muted-foreground">/month</span>}
                    </div>
                   <Separator className="my-6" />
                   <div className="grid grid-cols-3 gap-4 text-muted-foreground text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                            <BedDouble className="w-7 h-7 text-primary"/>
                            <span className="font-semibold">{property.bedrooms} Beds</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                             <Bath className="w-7 h-7 text-primary"/>
                            <span className="font-semibold">{property.bathrooms} Baths</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                            <AreaChart className="w-7 h-7 text-primary"/>
                            <span className="font-semibold">{property.area} sqft</span>
                        </div>
                   </div>
                </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>
            
            {property.amenities && property.amenities.length > 0 && (
                <Card className="mb-8">
                <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
                    {property.amenities.map((amenity: string) => (
                        <div key={amenity} className="flex items-center gap-3">
                        {amenityIcons[amenity] || <CheckCircle className="h-6 w-6 text-primary" />}
                        <span className="font-medium text-muted-foreground">{amenity}</span>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden border">
                  {mapSrc ? (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={mapSrc}>
                    </iframe>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">Map requires Google Maps API Key.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Contact Seller</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button asChild size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg">
                  <Link href={`tel:${sellerPhone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call Owner
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full font-bold text-lg">
                  <Link href={`https://wa.me/${sellerPhone}`} target="_blank">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Link>
                </Button>
                 <Separator className="my-2"/>
                 <p className="text-sm text-muted-foreground text-center">
                    Posted by <span className="font-bold text-foreground">{property.sellerName}</span>
                 </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
