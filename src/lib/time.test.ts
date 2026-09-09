import { describe, expect, it } from 'vitest';
import { relativeTime } from './time';

const now = new Date('2026-09-08T12:00:00Z');

describe('relative time', () => {
  it('counts in the largest unit that still reads naturally', () => {
    expect(relativeTime(new Date('2026-09-08T11:59:30Z'), now)).toBe(
      'just now',
    );
    expect(relativeTime(new Date('2026-09-08T11:58:00Z'), now)).toBe('2m ago');
    expect(relativeTime(new Date('2026-09-08T09:00:00Z'), now)).toBe('3h ago');
    expect(relativeTime(new Date('2026-09-05T12:00:00Z'), now)).toBe('3d ago');
    expect(relativeTime(new Date('2026-08-08T12:00:00Z'), now)).toBe('1mo ago');
    expect(relativeTime(new Date('2024-09-08T12:00:00Z'), now)).toBe('2y ago');
  });

  it('does not describe a future timestamp as time passed', () => {
    expect(relativeTime(new Date('2026-09-08T12:05:00Z'), now)).toBe(
      'just now',
    );
  });
});
