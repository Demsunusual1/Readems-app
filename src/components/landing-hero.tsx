'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Feather } from '@phosphor-icons/react';
import { useRef, useState } from 'react';

const slides = [
  {
    title: 'Stories that stay with you',
    copy: 'Read unforgettable stories, share your voice, and connect with readers and writers around the world.',
    image: '/readems/hero-storyteller.png',
    alt: 'A storyteller emerging from an illuminated open book',
  },
  {
    title: 'Beneath the Baobab Tree',
    copy: 'A family. A secret. A legacy that refuses to be buried.',
    image: '/readems/featured-beneath-the-baobab-tree.png',
    alt: 'A baobab tree at sunset',
  },
  {
    title: 'The Archivist of Salt',
    copy: 'Some archives remember what people try to forget.',
    image: '/readems/featured-archivist-of-salt.png',
    alt: 'An archivist surrounded by blue light',
  },
  {
    title: 'When Stars Learn to Bloom',
    copy: 'Love finds its way in the unlikeliest places.',
    image: '/readems/featured-when-stars-learn-to-bloom.png',
    alt: 'A woman beneath a star-filled sky',
  },
] as const;

export function LandingHero({
  readingHref,
  writingHref,
  signedIn,
}: {
  readingHref: string;
  writingHref: string;
  signedIn: boolean;
}) {
  const [active, setActive] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const slide = slides[active];
  return (
    <section
      className="landing-carousel"
      aria-label="Readems highlights"
      aria-roledescription="carousel"
      onTouchStart={(event) => {
        const point = event.touches[0];
        touch.current = { x: point.clientX, y: point.clientY };
      }}
      onTouchCancel={() => {
        touch.current = null;
      }}
      onTouchEnd={(event) => {
        if (!touch.current) return;
        const point = event.changedTouches[0];
        const dx = point.clientX - touch.current.x;
        const dy = point.clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
          setActive(
            (value) =>
              (value + (dx < 0 ? 1 : slides.length - 1)) % slides.length,
          );
      }}
    >
      <div
        className="official-hero landing-container"
        role="group"
        aria-roledescription="slide"
        aria-label={`${active + 1} of ${slides.length}`}
      >
        <div className="official-hero-copy">
          <p className="official-eyebrow">
            {active === 0 ? 'Welcome to Readems' : 'Featured story'}
          </p>
          <div aria-live="polite" aria-atomic="true">
            <h1 id="hero-title">
              {active === 0 ? (
                <>
                  Stories that <br />
                  stay <em>with you</em>
                </>
              ) : (
                slide.title
              )}
            </h1>
            <span className="hero-rule" aria-hidden="true" />
            <p className="hero-description">{slide.copy}</p>
          </div>
          <div className={`official-actions${signedIn ? ' is-signed-in' : ''}`}>
            <Link className="button button-primary" href={readingHref}>
              {signedIn ? 'Go to dashboard' : 'Start Reading'}
            </Link>
            <Link className="button button-secondary" href={writingHref}>
              <Feather aria-hidden="true" /> Start Writing
            </Link>
          </div>
        </div>
        <div className={`hero-asset${active ? ' hero-featured-asset' : ''}`}>
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={active === 0}
            sizes="(max-width: 767px) 55vw, 55vw"
          />
        </div>
      </div>
      <div
        className="hero-pagination"
        role="group"
        aria-label="Choose a highlight"
      >
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Show slide ${index + 1}: ${item.title}`}
            aria-current={active === index ? 'true' : undefined}
            onClick={() => setActive(index)}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}
