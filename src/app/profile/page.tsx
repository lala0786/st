import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <User className="h-12 w-12 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
                <p className="text-muted-foreground mt-2">
                    This page is under construction. Soon you will be able to manage your profile here.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
