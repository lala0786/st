export type Property = {
  id: string;
  title: string;
  type: 'Apartment' | 'House' | 'Plot' | 'Shop';
  transaction: 'Sell' | 'Rent';
  price: number;
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  images: string[];
  amenities: string[];
  sellerName: string;
  sellerPhone: string;
  featured: boolean;
  tag?: 'Just Listed' | 'Price Drop' | 'Popular';
};
