
import { Suspense } from 'react';
import { collection, getDocs, query, where, orderBy, QueryConstraint, and } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Property } from '@/lib/types';
import { PropertyCard } from '@/components/property-card';
import { PropertySearchForm } from '@/components/property-search-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 60; // Revalidate data every 60 seconds

async function getFilteredProperties(searchParams: { [key: string]: string | string[] | undefined }) {
  if (!db) {
    console.warn("Firestore is not initialized. Serving empty data.");
    return [];
  }

  const { type, listingType, search, minPrice, maxPrice, bedrooms } = searchParams;
  const propertiesRef = collection(db, "properties");
  let queryConstraints: QueryConstraint[] = [];

  // Important: Firestore requires an index for compound queries.
  // If you see an error in the browser console about needing an index,
  // click the link in the error message to create it automatically in Firebase.
  
  if (type && typeof type === 'string') {
    queryConstraints.push(where("propertyType", "==", type));
  }
  if (listingType && typeof listingType === 'string') {
    queryConstraints.push(where("listingType", "==", listingType));
  }
  if (minPrice && typeof minPrice === 'string' && !isNaN(Number(minPrice))) {
    queryConstraints.push(where("price", ">=", Number(minPrice)));
  }
   if (maxPrice && typeof maxPrice === 'string' && !isNaN(Number(maxPrice))) {
    queryConstraints.push(where("price", "<=", Number(maxPrice)));
  }
  if (bedrooms && typeof bedrooms === 'string') {
    if (bedrooms.includes('+')) {
      queryConstraints.push(where("bedrooms", ">=", parseInt(bedrooms)));
    } else {
      queryConstraints.push(where("bedrooms", "==", Number(bedrooms)));
    }
  }
  
  // Order by price if it's part of the filter, otherwise by creation date
  if (minPrice || maxPrice) {
    queryConstraints.push(orderBy("price", "asc"));
  } else {
    queryConstraints.push(orderBy("createdAt", "desc"));
  }

  let properties: Property[] = [];
  try {
    const q = query(propertiesRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const property = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null
      } as Property;

      // Firestore doesn't support text search, so we filter manually.
      // For production, use a dedicated search service like Algolia or Typesense.
      if (search && typeof search === 'string' && search.trim() !== '') {
          if (property.title.toLowerCase().includes(search.toLowerCase()) || property.location.toLowerCase().includes(search.toLowerCase())) {
              properties.push(property);
          }
      } else {
          properties.push(property);
      }
    });

    return properties;

  } catch (error) {
    console.error("Error fetching filtered properties: ", error);
    return [];
  }
}

function PropertiesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}


async function SearchResults({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const properties = await getFilteredProperties(searchParams);

  const getTitle = () => {
    if (Object.keys(searchParams).length > 0) {
        return "Search Results"
    }
    return 'All Properties';
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{getTitle()}</h1>
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
          <Home className="mx-auto h-12 w-12 mb-4" />
          <p className="font-semibold text-lg">No properties found for this filter.</p>
          <p className="text-sm">Try adjusting your search or check back later.</p>
          <Button asChild className="mt-4">
            <Link href="/search">Clear Filters</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <PropertySearchForm />
      </div>
      <Suspense fallback={<PropertiesGridSkeleton />} key={JSON.stringify(searchParams)}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
