import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'React Learning Portal',
  description: 'Interactive, persona-adaptive React learning for all skill levels',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-surface)]">{children}</body>
    </html>
  );
}
