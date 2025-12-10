
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search, Building2, Home, Trees, Building, ShoppingCart, DollarSign } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const quickFilters = [
    { label: 'Flats', href: '/search?type=Apartment', icon: Building2 },
    { label: 'Houses', href: '/search?type=House', icon: Home },
    { label: 'Plots', href: '/search?type=Plot', icon: Trees },
    { label: 'Commercial', href: '/search?type=Shop', icon: Building },
    { label: 'For Sale', href: '/search?listingType=Sell', icon: DollarSign },
    { label: 'For Rent', href: '/search?listingType=Rent', icon: ShoppingCart },
];

export function PropertySearchForm() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // A more robust solution would handle merging existing query params
        router.push(`/search?search=${encodeURIComponent(searchQuery)}`);
    }

    const handleQuickFilterClick = (href: string) => {
        router.push(href);
    }

    const handleAdvancedFilterClick = () => {
        toast({
            title: "Coming Soon!",
            description: "Advanced filters will be available in a future update.",
        });
    }

  return (
    <div className="space-y-4 my-6">
      <form onSubmit={handleSearch} className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            id="search" 
            placeholder="Search by location, landmark..." 
            className="pl-10 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" size="icon" className="h-12 w-12 flex-shrink-0">
          <Search className="h-5 w-5" />
           <span className="sr-only">Search</span>
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0" onClick={handleAdvancedFilterClick}>
          <SlidersHorizontal className="h-5 w-5" />
           <span className="sr-only">Filters</span>
        </Button>
      </form>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {quickFilters.map(filter => (
           <Button 
             key={filter.label} 
             variant="outline" 
             className="rounded-full flex-shrink-0 flex items-center gap-2"
             onClick={() => handleQuickFilterClick(filter.href)}
           >
             <filter.icon className="h-4 w-4 text-primary" />
             <span>{filter.label}</span>
           </Button>
        ))}
      </div>
    </div>
  );
}
