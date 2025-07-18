import type React from 'react';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import ClientWrapper from '../components/ClientWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Stytch B2B Demo',
  description: 'A demo app for Stytch B2B authentication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value !== 'false';

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ClientWrapper defaultOpen={defaultOpen}>{children}</ClientWrapper>
      </body>
    </html>
  );
}
