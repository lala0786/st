import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Pithampur Property Hub',
  description: 'Find your dream property in Pithampur. Buy, Sell, Rent properties with ease.',
  manifest: '/manifest.json',
};

// Check if Firebase keys are present in the environment
const isFirebaseEnabled = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
                          !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
                          !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                          !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
                          !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
                          !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      {isFirebaseEnabled && <AnalyticsProvider />}
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow pb-20">{children}</main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
