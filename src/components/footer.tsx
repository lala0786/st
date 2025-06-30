import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <span className="font-semibold">Pithampur Property Hub</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} All rights reserved.
        </p>
        <nav className="flex gap-4">
          <Link href="#" className="text-sm hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="text-sm hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
