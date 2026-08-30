import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Readems — Stories that move the world',
  description: 'Discover unforgettable stories and share your voice.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
