import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ScriptProof — payment page script monitoring & PCI DSS evidence',
    template: '%s · ScriptProof',
  },
  description:
    'Monitors your checkout pages for script and header changes, supports your PCI DSS 6.4.3 and 11.6.1 controls, and generates supporting evidence.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
