import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center text-center min-h-[calc(100vh-15rem)]">
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Search className="h-12 w-12 text-primary" />
                </div>
                 <CardTitle className="text-2xl font-bold pt-4">Advanced Search</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    Our advanced search and filtering page is under construction. Soon you'll be able to find your perfect property with powerful tools.
                </CardDescription>
            </CardContent>
        </Card>
    </div>
  );
}
