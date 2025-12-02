import { PropertyCard } from '@/components/property-card';
import { PropertySearchForm } from '@/components/property-search-form';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import Link from 'next/link';

async function getProperties(options: { featured?: boolean; limit?: number } = {}) {
    if (!db) {
        console.warn("Firestore is not initialized.");
        return [];
    }
    try {
        const propertiesRef = collection(db, "properties");
        let q;

        if (options.featured) {
            q = query(propertiesRef, where("featured", "==", true), orderBy("createdAt", "desc"));
        } else {
            q = query(propertiesRef, orderBy("createdAt", "desc"));
        }
        
        if (options.limit) {
            q = query(q, limit(options.limit));
        }

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
        return [];
    }
}


export default async function Home() {
  const featuredProperties = await getProperties({ featured: true, limit: 6 });
  const recentProperties = await getProperties({ limit: 6 });

  return (
    <div className="container mx-auto px-4 md:px-6 py-4">
      <PropertySearchForm />

      {featuredProperties && featuredProperties.length > 0 ? (
        <section className="my-12">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <Link href="/search">
                <Button variant="link" className="text-primary">See All</Button>
            </Link>
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
      ) : null}


      <section>
        <h2 className="text-2xl font-bold mb-4">Fresh Recommendations</h2>
        {recentProperties && recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
            ))}
            </div>
        ) : (
             <div className="text-center py-12 text-muted-foreground">
                <p>No properties found.</p>
                <p>Be the first to list a property in Pithampur!</p>
                <Button asChild className="mt-4">
                    <Link href="/list-property">List a Property</Link>
                </Button>
            </div>
        )}
      </section>
    </div>
  );
}
