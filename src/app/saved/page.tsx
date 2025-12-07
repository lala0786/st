"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PropertyCard } from '@/components/property-card';
import { Heart, Loader2 } from "lucide-react";
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SavedPropertiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        router.push("/login");
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!user || !db) {
        setLoading(false);
        return;
      }
      try {
        const savedPropertiesRef = collection(db, 'users', user.uid, 'savedProperties');
        const savedSnapshot = await getDocs(savedPropertiesRef);
        const propertyPromises = savedSnapshot.docs.map(async (savedDoc) => {
          const propertyId = savedDoc.data().propertyId;
          const propertyRef = doc(db, 'properties', propertyId);
          const propertySnap = await getDoc(propertyRef);
          if (propertySnap.exists()) {
             const data = propertySnap.data();
             return { 
                id: propertySnap.id, 
                ...data,
                createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null
            } as Property;
          }
          return null;
        });

        const properties = (await Promise.all(propertyPromises)).filter(p => p !== null) as Property[];
        setSavedProperties(properties);
      } catch (error) {
        console.error("Error fetching saved properties:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSavedProperties();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline flex items-center gap-2">
                    <Heart className="text-primary"/>
                    Your Saved Properties
                </CardTitle>
                <CardDescription>
                    Here are all the properties you've saved for later.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {savedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                        <Heart className="mx-auto h-12 w-12 mb-4" />
                        <p className="font-semibold text-lg">You haven't saved any properties yet.</p>
                        <p className="text-sm">Click the heart icon on any property to save it here.</p>
                        <Button asChild className="mt-4">
                            <Link href="/">Explore Properties</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
