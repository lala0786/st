"use client";

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';
import { usePathname } from 'next/navigation';
import { logEvent } from 'firebase/analytics';

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const logPageView = async () => {
        if (!analytics) return; // Do nothing if analytics is not initialized

        const analyticsInstance = await analytics;
        if (analyticsInstance) {
            logEvent(analyticsInstance, 'page_view', {
                page_path: pathname,
                page_title: document.title,
            });
        }
    }
    
    if (process.env.NODE_ENV === 'production') {
        logPageView();
    }
  }, [pathname]);

  return null;
}
