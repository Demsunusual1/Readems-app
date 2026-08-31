import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RemoteLandingImage } from './remote-landing-image';

describe('RemoteLandingImage', () => {
  it('preserves accessible context and aspect ratio when loading fails', () => {
    render(
      <RemoteLandingImage
        src="https://images.unsplash.com/photo-example"
        width={360}
        height={190}
        alt="A creator writing on a laptop"
      />,
    );

    fireEvent.error(screen.getByRole('img'));

    const fallback = screen.getByRole('img', {
      name: 'A creator writing on a laptop',
    });
    expect(fallback).toHaveClass('remote-image-fallback');
    expect(fallback).toHaveStyle({ aspectRatio: '360 / 190' });
  });
});
