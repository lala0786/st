'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search } from "lucide-react";

export function PropertySearchForm() {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <Card className="p-2 sm:p-4 shadow-2xl -mt-24 z-20 relative bg-card/80 backdrop-blur-md">
        <Tabs defaultValue="sale">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-4">
            <TabsTrigger value="sale">For Sale</TabsTrigger>
            <TabsTrigger value="rent">For Rent</TabsTrigger>
          </TabsList>
          <TabsContent value="sale">
            <SearchFormFields />
          </TabsContent>
          <TabsContent value="rent">
            <SearchFormFields />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function SearchFormFields() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div className="md:col-span-2">
        <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input id="location" placeholder="Enter locality, or city" className="pl-10" />
        </div>
      </div>
      <div>
        <label htmlFor="propertyType" className="block text-sm font-medium text-muted-foreground mb-1">Property Type</label>
        <Select>
          <SelectTrigger id="propertyType">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="plot">Plot</SelectItem>
            <SelectItem value="shop">Shop</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="lg" className="w-full">
        <Search className="mr-2 h-5 w-5" />
        Search
      </Button>
    </div>
  );
}
