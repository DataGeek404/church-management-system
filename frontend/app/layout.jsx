import React from 'react';
import { Providers } from './providers';
import { LayoutContent } from '@/app/components/LayoutContent';
import '/public/styles/index.css';
import '/public/styles/layout.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Church Management System',
  description: 'A web-based system designed to manage church membership, attendance, finances, events, communication, and reporting.',
};

export const viewport = 'width=device-width, initial-scale=1';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}

