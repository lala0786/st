"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Edit, LogOut } from "lucide-react";

// This is a mock user object. In a real app, you would get this from your authentication state.
const user = {
  name: "Alfej Shaikh",
  email: "alfej.shaikh.dev@example.com",
  phone: "+91 83590 69987",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400"
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                <CardDescription>Property Seller / Buyer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
                <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.phone}</span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:w-auto flex-grow">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
                <Button variant="outline" className="w-full sm:w-auto flex-grow">
                     My Listings
                </Button>
                 <Button variant="destructive" className="w-full sm:w-auto">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
