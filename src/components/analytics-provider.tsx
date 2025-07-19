"use client";

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';
import { usePathname } from 'next/navigation';
import { logEvent } from 'firebase/analytics';

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Do nothing if Firebase Analytics is not initialized
    if (!analytics) {
      return;
    }

    const logPageView = async () => {
        try {
            const analyticsInstance = await analytics;
            if (analyticsInstance) {
                logEvent(analyticsInstance, 'page_view', {
                    page_path: pathname,
                    page_title: document.title,
                });
            }
        } catch (error) {
            // This can happen if the promise rejects (e.g., in an unsupported environment)
            // We can silently ignore it or log it for debugging if needed.
            // console.error("Analytics logging failed:", error);
        }
    }
    
    if (process.env.NODE_ENV === 'production') {
        logPageView();
    }
  }, [pathname]);

  return null;
}
