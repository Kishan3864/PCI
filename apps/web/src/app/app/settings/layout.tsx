import type { ReactNode } from 'react';
import { SettingsNav } from '@/components/settings-nav';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SettingsNav />
      {children}
    </div>
  );
}
