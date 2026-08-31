'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type RemoteLandingImageProps = Omit<ImageProps, 'onError'>;

/** Keeps landing artwork dimensions and accessible context if a remote host is unavailable. */
export function RemoteLandingImage({
  alt,
  className,
  ...props
}: RemoteLandingImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`${className ?? ''} remote-image-fallback`}
        role="img"
        aria-label={alt}
      >
        <span>Artwork temporarily unavailable</span>
      </span>
    );
  }

  return (
    <Image
      {...props}
      className={className}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
