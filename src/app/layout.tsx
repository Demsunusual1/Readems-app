import type { Metadata } from 'next';
import { Fraunces, Literata, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const literata = Literata({ subsets: ['latin'], variable: '--font-literata' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });

export const metadata: Metadata = {
  metadataBase: new URL('https://readems.com'),
  title: 'Readems — Where Every Story Finds Its People',
  description:
    'Discover stories you’ll love, share your voice, and belong to a global community of readers and storytellers.',
  icons: { icon: '/readems-logo.svg', apple: '/readems-logo.svg' },
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
      <body
        className={`${manrope.variable} ${literata.variable} ${fraunces.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
