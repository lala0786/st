"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, Bell, User as UserIcon, ChevronDown, Sparkles, LogOut, Wand2, Calculator, Handshake } from "lucide-react";
import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "P";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return name.charAt(0);
  }

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Home className="h-6 w-6" />
          <span className="hidden sm:inline">Pithampur Homes</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild>
                <Link href="/dream-home">Dream Home AI</Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/interior-designer">Interior Designer</Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/property-qa">Property Q&A</Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/partners">Broker-Partner</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/calculator">EMI Calculator</Link>
            </Button>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={user.photoURL || undefined} data-ai-hint="person portrait" alt={user.displayName || "User avatar"} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
