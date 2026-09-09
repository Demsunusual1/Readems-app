/**
 * Cross-site request check for state-changing endpoints.
 *
 * Browsers always send `Origin` on a POST, so a missing or foreign origin is
 * refused. The host is read from the request headers rather than from
 * `request.url`: Next.js reports its own listening address there, which is
 * `localhost` behind any proxy and rejected every legitimate save.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
