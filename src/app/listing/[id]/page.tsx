import Image from 'next/image';
import { notFound } from 'next/navigation';
import { properties } from '@/lib/placeholder-data';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
    BedDouble, Bath, AreaChart, MapPin, Phone, MessageCircle, CheckCircle, User,
    Car, Zap, ArrowUpDown, Shield, Droplets, Lock, Road, Flower2, Waves, Users, Eye, Dumbbell, Gamepad2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';


const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === params.id);

  if (!property) {
    notFound();
  }
  
  const propertyTypeHints: { [key: string]: string } = {
    Apartment: 'apartment interior',
    House: 'house interior',
    Plot: 'empty plot',
    Shop: 'shop interior',
  }

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'Parking': <Car className="h-5 w-5 text-primary" />,
    'Power Backup': <Zap className="h-5 w-5 text-primary" />,
    'Lift': <ArrowUpDown className="h-5 w-5 text-primary" />,
    'Security': <Shield className="h-5 w-5 text-primary" />,
    'Water Supply': <Droplets className="h-5 w-5 text-primary" />,
    'Gated Community': <Lock className="h-5 w-5 text-primary" />,
    'Road': <Road className="h-5 w-5 text-primary" />,
    'Garden': <Flower2 className="h-5 w-5 text-primary" />,
    'Servant Quarters': <Users className="h-5 w-5 text-primary" />,
    'Main Road Facing': <Eye className="h-5 w-5 text-primary" />,
    'Private Pool': <Waves className="h-5 w-5 text-primary" />,
    'Gym': <Dumbbell className="h-5 w-5 text-primary" />,
    'Clubhouse': <Gamepad2 className="h-5 w-5 text-primary" />,
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-headline">{property.title}</h1>
          <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
            <MapPin className="w-5 h-5" /> {property.location}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Carousel className="w-full rounded-lg overflow-hidden shadow-lg mb-8">
              <CarouselContent>
                {property.images.map((img, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={img}
                      alt={`${property.title} image ${index + 1}`}
                      width={800}
                      height={500}
                      className="w-full h-auto object-cover aspect-[16/10]"
                      data-ai-hint={propertyTypeHints[property.type] || 'room interior'}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="text-xl font-bold">{formatPrice(property.price)}{property.transaction === 'Rent' ? '/mo' : ''}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <BedDouble className="mx-auto mb-1 h-6 w-6 text-primary" />
                            <p className="text-sm font-semibold">{property.bedrooms} Bedrooms</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <Bath className="mx-auto mb-1 h-6 w-6 text-primary" />
                            <p className="text-sm font-semibold">{property.bathrooms} Bathrooms</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <AreaChart className="mx-auto mb-1 h-6 w-6 text-primary" />
                            <p className="text-sm font-semibold">{property.area} sqft</p>
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
            
            <Card>
              <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3">
                      {amenityIcons[amenity] || <CheckCircle className="h-5 w-5 text-primary" />}
                      <span className="text-muted-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Seller</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person portrait" />
                        <AvatarFallback>{property.sellerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{property.sellerName}</p>
                        <p className="text-sm text-muted-foreground">Seller</p>
                    </div>
                </div>
                <Separator />
                <Button size="lg" className="w-full">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Seller
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
                 <p className="text-xs text-muted-foreground text-center">Sign in to view contact details.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
