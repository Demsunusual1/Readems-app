import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource-variable/lora';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://readems.com'),
  title: 'Readems — Where Every Story Finds Its People',
  description:
    'Discover stories you’ll love, share your voice, and belong to a global community of readers and storytellers.',
  openGraph: {
    title: 'Readems — Where Every Story Finds Its People',
    description:
      'Read unforgettable stories, publish your writing, and grow with a creative community.',
    type: 'website',
    siteName: 'Readems',
  },
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
