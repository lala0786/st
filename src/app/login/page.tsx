"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] bg-background py-12 px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email or phone to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login with Email
            </Button>
            
            <Separator className="my-2" />

            <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        required
                        className="flex-grow"
                    />
                     <Button>Send OTP</Button>
                </div>
            </div>
             <Button type="submit" variant="secondary" className="w-full">
                Login with OTP
            </Button>

          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
