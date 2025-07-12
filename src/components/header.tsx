"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, Bell, User as UserIcon, ChevronDown, Sparkles, LogOut } from "lucide-react";
import React from "react";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Home className="h-6 w-6" />
          <span className="hidden sm:inline">Pithampur Homes</span>
        </Link>
        
        <div className="flex-1 flex justify-center px-4">
            <Button variant="ghost" className="text-base">
                Pithampur
                <ChevronDown className="ml-1 h-4 w-4"/>
            </Button>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/property-qa">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="sr-only">AI Assistant</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person portrait" alt="User avatar" />
                  <AvatarFallback>PH</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
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
