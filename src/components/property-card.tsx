import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, AreaChart, Phone, MessageCircle, Heart } from 'lucide-react';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'carousel';
}

export function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const formatPrice = (price: number) => {
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

  return (
    <Card className={cn(
        "overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group w-full",
        variant === 'carousel' ? 'min-w-[300px]' : ''
    )}>
      <div className="relative">
        <Link href={`/listing/${property.id}`} className="block">
          <Image
            src={property.images[0]}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-52 object-cover"
            data-ai-hint={propertyTypeHints[property.type] || 'building exterior'}
          />
        </Link>
        <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 hover:bg-card">
            <Heart className="w-4 h-4 text-primary" />
            <span className="sr-only">Save</span>
        </Button>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
            <Link href={`/listing/${property.id}`}>
              <h3 className="text-base font-bold truncate group-hover:text-primary">{property.title}</h3>
              <p className="text-sm text-muted-foreground">{property.location}</p>
            </Link>
        </div>
        
        <div className="flex justify-between items-center text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <AreaChart className="w-4 h-4" />
            <span>{property.area} sqft</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-bold text-foreground">
                {formatPrice(property.price)} {property.transaction === 'Rent' && <span className="text-sm font-normal text-muted-foreground">/ month</span>}
            </p>
            <div className="flex items-center gap-2">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                    <Phone className="w-4 h-4"/>
                </Button>
                <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4"/>
                </Button>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
