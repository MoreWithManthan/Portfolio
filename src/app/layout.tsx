import { ThemeProvider } from '@/components/common/ThemeProviders';
import type { Metadata } from 'next';

import './globals.css';
import './reference.css';

export const metadata: Metadata = {
  title: 'Manthan Garg — Cybersecurity & Systems',
  description:
    'CSE student at Chitkara University. Explore my cybersecurity projects, published NeuroSole patent, IEEE leadership, and interactive security lab.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-hanken-grotesk antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
