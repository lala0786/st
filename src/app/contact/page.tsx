import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const faqs = [
  {
    question: "How do I list my property on the website?",
    answer: "You can list your property by clicking on the 'List Property' button in the header. You'll need to fill out a simple form with details about your property, and it will be submitted for review."
  },
  {
    question: "Are there any charges for listing a property?",
    answer: "Currently, listing your property on Pithampur Homes is completely free. There are no hidden charges."
  },
  {
    question: "How can I contact a property seller?",
    answer: "To contact a seller, you need to be logged into your account. Once logged in, you can view the seller's phone number or send them a message directly from the property details page."
  },
  {
    question: "Is this service only for properties in Pithampur?",
    answer: "Yes, our primary focus is on residential and commercial properties within Pithampur and its surrounding areas."
  }
];

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
            <CardDescription>We're here to help. Reach out to us with any questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Our Office</h3>
              <div className="pl-7 text-muted-foreground">
                  <p className="font-medium text-foreground">Pithampur Homes</p>
                  <p>123 Industrial Area, Sector 2</p>
                  <p>Pithampur, Madhya Pradesh 454775</p>
              </div>
            </div>
            <Separator />
             <div className="space-y-4">
              <h3 className="text-xl font-semibold">Direct Contact</h3>
               <div className="flex items-center gap-4 pl-7">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Alfej Shaikh</p>
                  <a href="tel:8359069987" className="text-muted-foreground hover:text-primary">8359069987</a>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-7">
                <Mail className="h-5 w-5 text-primary" />
                 <div>
                  <p className="font-medium">Email Us</p>
                  <a href="mailto:contact@pithampurhomes.com" className="text-muted-foreground hover:text-primary">contact@pithampurhomes.com</a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-center lg:text-left">
             <CardTitle className="text-3xl font-headline">Frequently Asked Questions</CardTitle>
             <CardDescription>Find answers to common questions below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
