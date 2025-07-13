import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Search className="h-12 w-12 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <CardTitle className="text-2xl font-bold">Search</CardTitle>
                <p className="text-muted-foreground mt-2">
                    This page is under construction. Soon you will be able to search and filter properties here.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
