import { describe, expect, it } from 'vitest';
import { isSameOrigin } from './http';

function request(headers: Record<string, string>) {
  // Next resolves `request.url` from its own listening address, not from the
  // host the reader typed, so the check must not read the origin from there.
  return new Request('http://localhost:3000/api/reading-progress', {
    method: 'POST',
    headers,
  });
}

describe('same-origin requests', () => {
  it('accepts a browser posting to the host it loaded', () => {
    expect(
      isSameOrigin(
        request({ origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000' }),
      ),
    ).toBe(true);
    expect(
      isSameOrigin(
        request({ origin: 'https://readems.com', host: 'readems.com' }),
      ),
    ).toBe(true);
  });

  it('accepts a proxied host when the proxy forwards it', () => {
    expect(
      isSameOrigin(
        request({
          origin: 'https://readems.com',
          host: 'localhost:3000',
          'x-forwarded-host': 'readems.com',
        }),
      ),
    ).toBe(true);
  });

  it('rejects another site posting to us', () => {
    expect(
      isSameOrigin(
        request({ origin: 'https://example.com', host: 'readems.com' }),
      ),
    ).toBe(false);
  });

  it('rejects a request with no origin at all', () => {
    expect(isSameOrigin(request({ host: 'readems.com' }))).toBe(false);
  });

  it('rejects a malformed origin', () => {
    expect(
      isSameOrigin(request({ origin: 'not a url', host: 'readems.com' })),
    ).toBe(false);
  });
});
