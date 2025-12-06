"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Handshake, Zap, Goal, UserPlus } from "lucide-react";

const benefits = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Expand Your Reach",
    description: "Get access to thousands of potential buyers and renters visiting our platform daily from Pithampur and beyond.",
  },
  {
    icon: <Goal className="h-8 w-8 text-primary" />,
    title: "AI-Powered Tools",
    description: "Use our 'Dream Home Finder' and other AI tools to perfectly match clients with properties, closing deals faster.",
  },
  {
    icon: <UserPlus className="h-8 w-8 text-primary" />,
    title: "Verified Leads",
    description: "Receive high-quality, verified leads directly in your dashboard. Spend less time searching and more time selling.",
  },
];

export default function PartnersPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <Handshake className="h-16 w-16 mx-auto text-primary" />
        <h1 className="text-4xl font-headline font-bold mt-4">Join Our Broker Partner Program</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Collaborate with Pithampur Homes to grow your real estate business. We believe in empowering local experts like you with modern technology.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 my-12 max-w-5xl mx-auto">
        {benefits.map((benefit, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                {benefit.icon}
              </div>
              <CardTitle className="pt-4">{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Become a Partner Today!</CardTitle>
          <CardDescription>Fill out the form below, and our team will get in touch with you shortly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="Your Phone Number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="Your Email Address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Your Experience</Label>
            <Textarea id="experience" placeholder="Tell us a bit about your experience in the real estate market." />
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full">
            Submit Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
