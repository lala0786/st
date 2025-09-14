import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, AreaChart, Phone, MessageCircle, Heart, Eye } from 'lucide-react';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'carousel';
}

export function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (isNaN(price)) return "N/A";
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
  
  const photoUrl = property.photos && property.photos.length > 0 ? property.photos[0] : "https://placehold.co/400x250/F0FAFB/A0CED9?text=No+Image";
  
  const postedDate = property.createdAt ? formatDistanceToNow(property.createdAt.toDate(), { addSuffix: true }) : 'Recently';


  return (
    <Card className={cn(
        "overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group w-full flex flex-col",
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
            className="w-full h-52 object-cover"
            data-ai-hint={propertyTypeHints[property.propertyType] || 'building exterior'}
          />
        </Link>
        <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 hover:bg-card">
            <Heart className="w-4 h-4 text-primary" />
            <span className="sr-only">Save</span>
        </Button>
      </div>
      <CardContent className="p-4 space-y-3 flex-grow flex flex-col justify-between">
        <div>
            <Link href={`/listing/${property.id}`}>
              <h3 className="text-base font-bold truncate group-hover:text-primary">{property.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{property.location}</p>
            </Link>
        </div>
        
        <div className="flex justify-between items-center text-muted-foreground text-sm py-2">
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

        <div className="border-t border-border pt-3 space-y-3">
            <div className="flex justify-between items-center">
                 <p className="text-lg font-bold text-foreground">
                    {formatPrice(property.price)} {property.listingType === 'Rent' && <span className="text-sm font-normal text-muted-foreground">/ month</span>}
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
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <p>Posted {postedDate}</p>
                <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{property.views || 0} views</span>
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
