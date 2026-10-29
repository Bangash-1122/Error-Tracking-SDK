import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'ErrorPulse | Commercial Error Monitoring & Exception Tracking SaaS',
  description: 'Enterprise-grade multi-tenant exception tracking, crash analytics, and telemetry dashboard',
};

import { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F5F8FC] text-[#0F172A]">
        {/* Unregister any stale Service Worker and clear old caches on localhost:3000 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      for (var i = 0; i < regs.length; i++) { regs[i].unregister(); }
                    });
                  }
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      for (var i = 0; i < keys.length; i++) { caches.delete(keys[i]); }
                    });
                  }
                  window.addEventListener('unhandledrejection', function(event) {
                    var msg = event.reason ? (event.reason.message || String(event.reason)) : '';
                    if (
                      msg.indexOf("Request scheme 'chrome-extension' is unsupported") !== -1 ||
                      msg.indexOf("Failed to convert value to 'Response'") !== -1 ||
                      (event.reason && event.reason.stack && event.reason.stack.indexOf('sw.js') !== -1)
                    ) {
                      event.preventDefault();
                    }
                  });
                }
              })();
            `,
          }}
        />
        <QueryProvider>
          <AppProvider>
            <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#10203C] text-white">Loading ErrorPulse...</div>}>
              {children}
            </Suspense>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
