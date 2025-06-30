"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg role="img" viewBox="0 0 24 24" {...props} xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 2.04-4.87 2.04-5.87 0-9.4-4.92-9.4-10.9s3.53-10.9 9.4-10.9c3.24 0 5.22 1.44 6.32 2.58l2.5-2.5C20.42 1.32 17.06 0 12.48 0 5.6 0 0 5.6 0 12.5s5.6 12.5 12.48 12.5c7.2 0 12.24-4.44 12.24-12.72 0-.8-.08-1.56-.2-2.28z" fill="currentColor" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] bg-background py-12 px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             <Button variant="outline" className="w-full">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Login with Google
            </Button>
            
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
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
