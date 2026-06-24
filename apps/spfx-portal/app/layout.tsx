import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPFx Learning Portal',
  description: 'Master SharePoint Framework with the modern Heft toolchain',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-surface)]">{children}</body>
    </html>
  );
}
