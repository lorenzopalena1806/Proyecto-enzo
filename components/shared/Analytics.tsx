'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-VE1XD63VFL';
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && GA_TRACKING_ID) {
      // @ts-ignore
      window.gtag?.('config', GA_TRACKING_ID, {
        page_path: pathname,
      });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname && FB_PIXEL_ID) {
      import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init(FB_PIXEL_ID);
          ReactPixel.pageView();
        });
    }
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* Global Site Tag (gtag.js) - Google Analytics */}
      {GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Meta Pixel is initialized on the client via react-facebook-pixel */}
      {/* We add a noscript fallback just in case */}
      {FB_PIXEL_ID && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
      )}
    </>
  );
}
