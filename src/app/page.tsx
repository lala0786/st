import { Suspense } from 'react';
import { PropertyCard } from '@/components/property-card';
import { PropertySearchForm } from '@/components/property-search-form';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

async function getProperties(options: { featured?: boolean; limit?: number } = {}) {
    if (!db) {
        console.warn("Firestore is not initialized. Serving empty data.");
        return [];
    }
    try {
        const propertiesRef = collection(db, "properties");
        let q;

        const queryConstraints = [orderBy("createdAt", "desc")];
        if (options.featured) {
            queryConstraints.unshift(where("featured", "==", true));
        }
        if (options.limit) {
            queryConstraints.push(limit(options.limit));
        }

        q = query(propertiesRef, ...queryConstraints);

        const querySnapshot = await getDocs(q);
        const properties: Property[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            properties.push({ 
                id: doc.id, 
                ...data,
                // Firestore Timestamps need to be converted for Next.js server components
                createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null
            } as Property);
        });
        return properties;
    } catch (error) {
        console.error("Error fetching properties: ", error);
        // In a real app, you might want to throw the error to be caught by an error boundary
        return [];
    }
}

function PropertiesGridSkeleton({ count = 3 }: { count?: number }) {
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

async function FeaturedProperties() {
  const featuredProperties = await getProperties({ featured: true, limit: 6 });

  if (!featuredProperties || featuredProperties.length === 0) {
    return null;
  }

  return (
    <section className="my-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Featured Properties</h2>
        <Button variant="link" className="text-primary" asChild>
            <Link href="/search">See All</Link>
        </Button>
      </div>
      <Carousel opts={{ align: "start", loop: featuredProperties.length > 2 }} className="w-full">
        <CarouselContent className="-ml-2">
          {featuredProperties.map((property) => (
            <CarouselItem key={property.id} className="md:basis-1/2 lg:basis-1/3 pl-2">
              <div className="p-1">
                <PropertyCard property={property} variant="carousel" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </section>
  );
}

async function RecentProperties() {
  const recentProperties = await getProperties({ limit: 6 });

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Fresh Recommendations</h2>
      {recentProperties && recentProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg">
          <p className="font-semibold">No properties found.</p>
          <p>Be the first to list a property in Pithampur!</p>
          <Button asChild className="mt-4">
            <Link href="/list-property">List a Property</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-4">
      <PropertySearchForm />

      <Suspense fallback={<PropertiesGridSkeleton count={3} />}>
        <FeaturedProperties />
      </Suspense>

      <Suspense fallback={<PropertiesGridSkeleton count={6} />}>
        <RecentProperties />
      </Suspense>
    </div>
  );
}
