
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search, Building2, Home, Trees, Building, ShoppingCart, DollarSign, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

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
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Component state for form inputs
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [propertyType, setPropertyType] = useState<string | undefined>(searchParams.get('type') || undefined);
    const [bedrooms, setBedrooms] = useState<string | undefined>(searchParams.get('bedrooms') || undefined);
    const [listingType, setListingType] = useState<string | undefined>(searchParams.get('listingType') || undefined);

    // Update state if URL params change
    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setPropertyType(searchParams.get('type') || undefined);
        setBedrooms(searchParams.get('bedrooms') || undefined);
        setListingType(searchParams.get('listingType') || undefined);
    }, [searchParams]);

    const createQueryString = (params: Record<string, string | number | undefined>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(params)) {
            if (value) {
                newParams.set(key, String(value));
            } else {
                newParams.delete(key);
            }
        }
        return newParams.toString();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?${createQueryString({ search: searchQuery })}`);
    };

    const handleFilterApply = () => {
        router.push(`/search?${createQueryString({
            search: searchQuery,
            minPrice,
            maxPrice,
            type: propertyType,
            bedrooms,
            listingType
        })}`);
    };
    
    const removeFilter = (key: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete(key);
        router.push(`${pathname}?${newParams.toString()}`);
    }
    
    const activeFilters = Array.from(searchParams.entries());

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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0">
                            <SlidersHorizontal className="h-5 w-5" />
                            <span className="sr-only">Filters</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Advanced Filters</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div>
                                <Label className="font-semibold">Price Range (₹)</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input placeholder="Min Price" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                                    <Input placeholder="Max Price" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                                </div>
                            </div>
                             <div>
                                <Label className="font-semibold">Property Type</Label>
                                 <ToggleGroup type="single" value={propertyType} onValueChange={(value) => setPropertyType(value)} className="flex-wrap justify-start mt-2">
                                    <ToggleGroupItem value="Apartment">Apartment</ToggleGroupItem>
                                    <ToggleGroupItem value="House">House</ToggleGroupItem>
                                    <ToggleGroupItem value="Plot">Plot</ToggleGroupItem>
                                    <ToggleGroupItem value="Shop">Shop</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                             <div>
                                <Label className="font-semibold">Bedrooms</Label>
                                 <ToggleGroup type="single" value={bedrooms} onValueChange={(value) => setBedrooms(value)} className="flex-wrap justify-start mt-2">
                                    <ToggleGroupItem value="1">1</ToggleGroupItem>
                                    <ToggleGroupItem value="2">2</ToggleGroupItem>
                                    <ToggleGroupItem value="3">3</ToggleGroupItem>
                                    <ToggleGroupItem value="4">4+</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                        <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" onClick={handleFilterApply}>Apply Filters</Button>
                             </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
            
             {activeFilters.length > 0 && (
                <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-sm font-medium">Active Filters:</span>
                    {activeFilters.map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="flex items-center gap-1">
                           {key}: {value}
                           <button onClick={() => removeFilter(key)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                             <X className="h-3 w-3"/>
                           </button>
                        </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => router.push(pathname)}>Clear All</Button>
                </div>
            )}
        </div>
    );
}
