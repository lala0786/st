import { PropertyCard } from '@/components/property-card';
import { PropertySearchForm } from '@/components/property-search-form';
import { properties } from '@/lib/placeholder-data';
import Image from 'next/image';

export default function Home() {
  const featuredProperties = properties.filter((p) => p.featured);
  const recentProperties = properties.slice(0, 6);

  return (
    <div>
      <section className="relative h-[60vh] bg-background flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1920&auto=format&fit=crop"
          alt="Hero background"
          fill
          className="absolute inset-0 z-0 object-cover"
          data-ai-hint="luxury modern architecture"
          priority
        />
        <div className="relative z-20 text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
            Discover Your Next Chapter
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            The premier destination for exceptional properties in Pithampur. Your future home awaits.
          </p>
        </div>
      </section>
      
      <PropertySearchForm />

      <div className="container mx-auto px-4 md:px-6 py-12">
        <section id="sale" className="mb-16">
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
