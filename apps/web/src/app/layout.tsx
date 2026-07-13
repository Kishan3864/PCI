import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
