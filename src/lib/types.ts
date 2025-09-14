import { Timestamp } from "firebase/firestore";

export type Property = {
  id: string;
  title: string;
  propertyType: 'Apartment' | 'House' | 'Plot' | 'Shop';
  listingType: 'Sell' | 'Rent';
  price: number;
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  photos: string[];
  amenities?: string[];
  sellerName: string;
  sellerPhone?: string;
  featured: boolean;
  tag?: 'Just Listed' | 'Price Drop' | 'Popular';
  sellerId: string;
  createdAt: Timestamp | null;
  views?: number;
};
