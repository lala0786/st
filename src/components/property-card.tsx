import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, AreaChart, MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
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
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/listing/${property.id}`} className="block">
        <div className="relative">
          <Image
            src={property.images[0]}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-56 object-cover"
            data-ai-hint={propertyTypeHints[property.type] || 'building exterior'}
          />
          <Badge
            className="absolute top-3 left-3"
            variant={property.transaction === 'Rent' ? 'accent' : 'secondary'}
          >
            {property.transaction === 'Sell' ? 'For Sale' : 'For Rent'}
          </Badge>
          {property.featured && (
             <Badge className="absolute top-3 right-3" variant="destructive">Featured</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
             <MapPin className="w-4 h-4" /> {property.location}
          </p>
          <h3 className="text-lg font-semibold truncate mb-2">{property.title}</h3>
          <p className="text-2xl font-bold text-primary mb-3">
            {formatPrice(property.price)} {property.transaction === 'Rent' && '/ month'}
          </p>
          <div className="flex justify-between items-center text-muted-foreground text-sm border-t pt-3">
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
        </CardContent>
      </Link>
    </Card>
  );
}
