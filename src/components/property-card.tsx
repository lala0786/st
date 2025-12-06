"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, AreaChart, Phone, MessageCircle, Heart, Eye } from 'lucide-react';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface PropertyCardProps {
  property: Partial<Property>;
  variant?: 'default' | 'carousel';
}

// Simple, solid color placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || isNaN(price)) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const propertyTypeHints: { [key: string]: string } = {
    Apartment: 'apartment exterior',
    House: 'modern house',
    Plot: 'empty plot',
    Shop: 'storefront building',
  }

  const getBadge = () => {
    if (property.tag) {
      let variant: 'destructive' | 'accent' = 'accent';
      if (property.tag === 'Price Drop') {
        variant = 'destructive';
      }
      return <Badge variant={variant} className="absolute top-2 left-2 z-10">{property.tag}</Badge>
    }
    return null;
  }
  
  const photoUrl = property.photos && property.photos.length > 0 ? property.photos[0] : "";
  
  const postedDate = property.createdAt ? formatDistanceToNow(new Date(property.createdAt.seconds * 1000), { addSuffix: true }) : 'Recently';

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    setIsSaved(!isSaved);
  };

  return (
    <Card className={cn(
        "overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group w-full flex flex-col border border-border/50",
        variant === 'carousel' ? 'min-w-[300px]' : ''
    )}>
      <div className="relative">
        {getBadge()}
        <Link href={`/listing/${property.id}`} className="block">
          <Image
            src={photoUrl}
            alt={property.title || 'Property image'}
            width={400}
            height={250}
            className="w-full h-52 object-cover bg-muted"
            data-ai-hint={propertyTypeHints[property.propertyType || 'House'] || 'building exterior'}
            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 250))}`}
          />
        </Link>
        <Button 
          size="icon" 
          variant="secondary" 
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 hover:bg-card z-10 transition-transform transform-gpu",
            isSaved ? 'animate-heart-pop' : ''
          )}
          onClick={handleSaveToggle}
        >
            <Heart className={cn("w-4 h-4 text-primary transition-colors", isSaved && "fill-pink-500 text-pink-500")} />
            <span className="sr-only">Save</span>
        </Button>
      </div>
      <CardContent className="p-4 space-y-3 flex-grow flex flex-col justify-between bg-card">
        <div>
            <Link href={`/listing/${property.id}`}>
              <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors">{property.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{property.location}</p>
            </Link>
        </div>
        
        <div className="flex justify-between items-center text-muted-foreground text-sm py-2">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4" />
            <span>{property.bedrooms ?? 0} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms ?? 0} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AreaChart className="w-4 h-4" />
            <span>{property.area ?? 0} sqft</span>
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-3">
            <div className="flex justify-between items-center">
                 <p className="text-lg font-bold text-foreground">
                    {formatPrice(property.price)} {property.listingType === 'Rent' && <span className="text-sm font-normal text-muted-foreground">/ month</span>}
                </p>
                <div className="flex items-center gap-2">
                    <Button size="icon" className="bg-secondary hover:bg-secondary/90 h-8 w-8">
                        <Phone className="w-4 h-4"/>
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8">
                        <MessageCircle className="w-4 h-4"/>
                    </Button>
                </div>
            </div>
            {property.createdAt && (
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <p>Posted {postedDate}</p>
                  <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{property.views || 0} views</span>
                  </div>
              </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
}
