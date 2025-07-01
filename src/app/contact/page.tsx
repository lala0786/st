import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
          <CardDescription>We're here to help. Reach out to us with any questions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Our Office</h3>
              <div className="pl-7 text-muted-foreground">
                  <p className="font-medium text-foreground">Pithampur Property Hub</p>
                  <p>123 Industrial Area, Sector 2</p>
                  <p>Pithampur, Madhya Pradesh 454775</p>
              </div>
            </div>
             <div className="space-y-4">
              <h3 className="text-xl font-semibold">Direct Contact</h3>
               <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Alfej Shaikh</p>
                  <a href="tel:8359069987" className="text-muted-foreground hover:text-primary">8359069987</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" />
                 <div>
                  <p className="font-medium">Email Us</p>
                  <a href="mailto:contact@pithampurpropertyhub.com" className="text-muted-foreground hover:text-primary">contact@pithampurpropertyhub.com</a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
