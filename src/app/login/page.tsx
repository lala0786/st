"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg role="img" viewBox="0 0 24 24" {...props} xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 2.04-4.87 2.04-5.87 0-9.4-4.92-9.4-10.9s3.53-10.9 9.4-10.9c3.24 0 5.22 1.44 6.32 2.58l2.5-2.5C20.42 1.32 17.06 0 12.48 0 5.6 0 0 5.6 0 12.5s5.6 12.5 12.48 12.5c7.2 0 12.24-4.44 12.24-12.72 0-.8-.08-1.56-.2-2.28z" fill="currentColor" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!auth) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
  }, []);

  const handleLoginSuccess = () => {
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
    router.push("/profile");
  }

  const handleLoginError = (title: string, description: string) => {
     toast({
        title,
        description,
        variant: "destructive",
      });
  }

  const handleGoogleLogin = async () => {
    if (!auth) {
      handleLoginError("Configuration Error", "Firebase is not configured. Please add API keys.");
      return;
    }
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleLoginSuccess();
    } catch (error) {
      console.error("Error during Google login: ", error);
      handleLoginError("Login Failed", "Could not log in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
       handleLoginError("Configuration Error", "Firebase is not configured.");
       return;
    }
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        handleLoginSuccess();
    } catch (error: any) {
        console.error("Error during email login: ", error);
        handleLoginError("Login Failed", error.message || "Please check your credentials and try again.");
    } finally {
        setLoading(false);
    }
  }
  
  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth) {
          handleLoginError("Configuration Error", "Firebase is not configured.");
          return;
      }
      setLoading(true);
      try {
          const formattedPhone = `+91${phone}`; // Assuming Indian numbers
          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
          setConfirmationResult(confirmation);
          setOtpSent(true);
          toast({ title: "OTP Sent", description: `An OTP has been sent to ${formattedPhone}` });
      } catch (error: any) {
          console.error("Error sending OTP: ", error);
          handleLoginError("OTP Error", error.message || "Could not send OTP. Please check the number.");
          // Reset reCAPTCHA
          window.recaptchaVerifier.render().then((widgetId: any) => {
            if(auth) {
              window.grecaptcha.reset(widgetId);
            }
          });
      } finally {
          setLoading(false);
      }
  }

  const handleOtpLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!confirmationResult) {
          handleLoginError("OTP Error", "Please request an OTP first.");
          return;
      }
      setLoading(true);
      try {
          await confirmationResult.confirm(otp);
          handleLoginSuccess();
      } catch (error: any) {
          console.error("Error verifying OTP: ", error);
          handleLoginError("Login Failed", error.message || "Invalid OTP. Please try again.");
      } finally {
          setLoading(false);
      }
  }

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
             <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
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
            <form onSubmit={handleEmailLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login with Email
                </Button>
              </div>
            </form>
            
            <Separator className="my-2" />
            
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="10-digit mobile number"
                            required
                            className="flex-grow"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                        />
                        <Button type="submit" disabled={loading || !phone}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                        </Button>
                    </div>
                </div>
              </form>
            ) : (
               <form onSubmit={handleOtpLogin}>
                  <div className="grid gap-4">
                      <div className="grid gap-2">
                          <Label htmlFor="otp">Enter OTP</Label>
                          <Input
                              id="otp"
                              type="text"
                              placeholder="6-digit OTP"
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              disabled={loading}
                          />
                      </div>
                      <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
                           {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Login with OTP
                      </Button>
                  </div>
              </form>
            )}

          </div>
          <div id="recaptcha-container"></div>
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
