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
