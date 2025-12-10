// This file contains placeholder data for seeding the Firestore database.
// You can use the provided script to upload this data to your project.

export const seedProperties = [
  {
    "id": "prop1",
    "title": "Modern 2BHK Apartment with City View",
    "propertyType": "Apartment",
    "listingType": "Sell",
    "price": 4500000,
    "location": "Mhow-Neemuch Road, Pithampur",
    "area": 1200,
    "bedrooms": 2,
    "bathrooms": 2,
    "description": "A beautifully designed 2BHK apartment located in a prime area of Pithampur. Features a modern kitchen, spacious living room, and a balcony with a stunning city view. Perfect for small families.",
    "photos": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
    ],
    "amenities": ["Parking", "Lift", "Security", "Water Supply"],
    "sellerName": "Rohan Sharma",
    "sellerPhone": "+919876543210",
    "featured": true,
    "tag": "Just Listed",
    "sellerId": "dummy-seller-1",
    "createdAt": { "seconds": 1672531200, "nanoseconds": 0 }, // Jan 1, 2023
    "views": 120
  },
  {
    "id": "prop2",
    "title": "Spacious 3BHK Independent House",
    "propertyType": "House",
    "listingType": "Sell",
    "price": 8500000,
    "location": "Sector 1, Pithampur",
    "area": 2000,
    "bedrooms": 3,
    "bathrooms": 3,
    "description": "An independent house with a small garden and private parking. Located in a peaceful and green neighborhood. Ideal for a large family looking for a quiet lifestyle.",
    "photos": [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop"
    ],
    "amenities": ["Parking", "Garden", "Gated Community"],
    "sellerName": "Priya Verma",
    "sellerPhone": "+919876543211",
    "featured": true,
    "tag": "Popular",
    "sellerId": "dummy-seller-2",
    "createdAt": { "seconds": 1675209600, "nanoseconds": 0 }, // Feb 1, 2023
    "views": 250
  },
  {
    "id": "prop3",
    "title": "Residential Plot in a Gated Community",
    "propertyType": "Plot",
    "listingType": "Sell",
    "price": 3000000,
    "location": "Sagore, Pithampur",
    "area": 1500,
    "bedrooms": 0,
    "bathrooms": 0,
    "description": "A 1500 sq. ft. residential plot in a well-developed gated community. The community has wide roads, a park, and 24/7 security. Perfect for building your dream home.",
    "photos": [
      "https://images.unsplash.com/photo-1593946234992-a68153314943?q=80&w=2074&auto=format&fit=crop"
    ],
    "amenities": ["Gated Community", "Security", "Road"],
    "sellerName": "Ankit Jain",
    "sellerPhone": "+919876543212",
    "featured": false,
    "sellerId": "dummy-seller-3",
    "createdAt": { "seconds": 1677628800, "nanoseconds": 0 }, // Mar 1, 2023
    "views": 85
  },
  {
    "id": "prop4",
    "title": "Commercial Shop on Main Road",
    "propertyType": "Shop",
    "listingType": "Rent",
    "price": 25000,
    "location": "Industrial Area, Sector 3, Pithampur",
    "area": 800,
    "bedrooms": 0,
    "bathrooms": 1,
    "description": "A main road facing commercial shop, suitable for any retail business. High footfall area with excellent visibility. Includes a small washroom and storage area.",
    "photos": [
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop"
    ],
    "amenities": ["Main Road Facing", "Parking"],
    "sellerName": "Sunita Gupta",
    "sellerPhone": "+919876543213",
    "featured": true,
    "sellerId": "dummy-seller-4",
    "createdAt": { "seconds": 1680307200, "nanoseconds": 0 }, // Apr 1, 2023
    "views": 150
  },
  {
    "id": "prop5",
    "title": "Affordable 1BHK for Rent",
    "propertyType": "Apartment",
    "listingType": "Rent",
    "price": 8000,
    "location": "Housing Board Colony, Pithampur",
    "area": 600,
    "bedrooms": 1,
    "bathrooms": 1,
    "description": "A compact and affordable 1BHK apartment available for rent. Suitable for bachelors or a small family. Close to the market and public transport.",
    "photos": [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop"
    ],
    "amenities": ["Water Supply"],
    "sellerName": "Vikas Singh",
    "sellerPhone": "+919876543214",
    "featured": false,
    "tag": "Price Drop",
    "sellerId": "dummy-seller-5",
    "createdAt": { "seconds": 1682899200, "nanoseconds": 0 }, // May 1, 2023
    "views": 310
  }
];
