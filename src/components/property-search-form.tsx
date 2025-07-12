'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const quickFilters = ['Flats', 'Houses', 'Plots', 'Commercial', 'Buy', 'Rent', 'Sell'];

export function PropertySearchForm() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input id="location" placeholder="Search for properties in Pithampur..." className="pl-10 h-12 text-base" />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {quickFilters.map(filter => (
           <Button key={filter} variant="outline" className="rounded-full flex-shrink-0">
             {filter}
           </Button>
        ))}
      </div>
    </div>
  );
}
