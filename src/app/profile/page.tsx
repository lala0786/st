"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Mail, Phone, Edit, LogOut, Loader2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Property[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchUserListings = useCallback(async () => {
    if (!user || !db) return;
    setLoadingListings(true);
    try {
      const propertiesRef = collection(db, "properties");
      const q = query(propertiesRef, where("sellerId", "==", user.uid), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const userListings: Property[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userListings.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null
        } as Property);
      });
      setListings(userListings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      toast({
        title: "Error",
        description: "Could not fetch your properties.",
        variant: "destructive",
      });
    } finally {
      setLoadingListings(false);
    }
  }, [user, toast]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Logout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return name.charAt(0);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Tabs defaultValue="profile" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="listings" onClick={fetchUserListings}>My Listings</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="person portrait" />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl font-headline">{user.displayName || "User"}</CardTitle>
                <CardDescription>Property Seller / Buyer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-left max-w-md mx-auto">
                <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.phoneNumber || "Not provided"}</span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button disabled>
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
                 <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
              <CardDescription>Here are the properties you have listed on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingListings ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {listings.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <Home className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-semibold">You haven't listed any properties yet.</p>
                    <p className="text-sm">Click the button below to get started.</p>
                    <Button asChild className="mt-4" onClick={() => router.push('/list-property')}>
                        <a>List a Property</a>
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}