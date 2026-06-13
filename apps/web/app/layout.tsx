import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wedding Surface Agent',
  description: 'AIHompy onboarding bundle generator for wedding_sdm tenants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
