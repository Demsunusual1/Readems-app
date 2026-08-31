'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type RemoteLandingImageProps = Omit<ImageProps, 'onError'>;

/** Keeps landing artwork dimensions and accessible context if a remote host is unavailable. */
export function RemoteLandingImage({
  alt,
  className,
  width,
  height,
  style,
  ...props
}: RemoteLandingImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const aspectRatio = width && height ? `${width} / ${height}` : undefined;

    return (
      <span
        className={`${className ?? ''} remote-image-fallback`}
        role="img"
        aria-label={alt}
        style={{ ...style, aspectRatio }}
      >
        <span>Artwork temporarily unavailable</span>
      </span>
    );
  }

  return (
    <Image
      {...props}
      width={width}
      height={height}
      style={style}
      className={className}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
