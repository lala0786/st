"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] bg-background py-12 px-4">
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                Create an account to list your properties and contact sellers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="9876543210" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Create an account
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline hover:text-primary">
                    Login
                </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
