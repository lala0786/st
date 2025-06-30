import { PropertyCard } from '@/components/property-card';
import { PropertySearchForm } from '@/components/property-search-form';
import { properties } from '@/lib/placeholder-data';
import Image from 'next/image';

export default function Home() {
  const featuredProperties = properties.filter((p) => p.featured);
  const recentProperties = properties.slice(0, 6);

  return (
    <div>
      <section className="relative h-[50vh] bg-primary/20 flex items-center justify-center">
        <Image
          src="https://placehold.co/1920x600.png"
          alt="Hero background"
          fill
          className="absolute inset-0 z-0 object-cover opacity-30"
          data-ai-hint="modern architecture cityscape"
          priority
        />
        <div className="relative z-10 text-center text-card-foreground p-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-foreground">
            Find Your Dream Property
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            The best place to find residential and commercial properties in Pithampur.
          </p>
        </div>
      </section>
      
      <PropertySearchForm />

      <div className="container mx-auto px-4 md:px-6 py-12">
        <section id="buy" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 font-headline">Featured Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        <section id="rent">
          <h2 className="text-3xl font-bold mb-6 font-headline">Recent Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
