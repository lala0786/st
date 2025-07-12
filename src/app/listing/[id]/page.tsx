import Image from 'next/image';
import { notFound } from 'next/navigation';
import { properties } from '@/lib/placeholder-data';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
    BedDouble, Bath, AreaChart, MapPin, Phone, MessageCircle, CheckCircle, Car, Zap, Shield, Droplets, Flower2, Home, User
} from 'lucide-react';
import React from 'react';

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

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <Carousel className="w-full rounded-lg overflow-hidden border mb-8">
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
                    <CardTitle className="text-3xl font-bold">{property.title}</CardTitle>
                    <CardDescription className="flex items-center pt-2">
                        <MapPin className="w-4 h-4 mr-1" /> {property.location}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline space-x-2">
                         <span className="text-4xl font-bold text-primary">{formatPrice(property.price)}</span>
                        {property.transaction === 'Rent' && <span className="text-lg text-muted-foreground">/month</span>}
                    </div>
                   <div className="grid grid-cols-3 gap-4 text-muted-foreground mt-6 text-center">
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
            
            {property.amenities.length > 0 && (
                <Card className="mb-8">
                <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
                    {property.amenities.map((amenity) => (
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
                    <Image 
                        src="https://placehold.co/800x450.png"
                        alt="Map placeholder"
                        width={800}
                        height={450}
                        className="w-full h-full object-cover"
                        data-ai-hint="map"
                    />
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
                <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Owner
                </Button>
                <Button size="lg" variant="outline" className="w-full font-bold text-lg">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
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
