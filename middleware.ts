import { NextResponse, type NextRequest } from 'next/server';

// Per-request nonce lets script-src drop 'unsafe-inline'/'unsafe-eval' — Next
// auto-applies this nonce to its own hydration/framework scripts once it's
// present on the CSP header, see https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Inline `style={{...}}` is used throughout the portal (no CSS-in-JS
    // nonce support for style attributes), so style-src keeps unsafe-inline.
    `style-src 'self' 'unsafe-inline'`,
    // facebook.com: Meta Pixel's <noscript> fallback beacon (/tr?...) is an
    // <img> tag. The fbevents.js script itself loads fine under
    // 'strict-dynamic' (it's inserted by our nonce'd bootstrap script)
    // without needing connect.facebook.net listed here too.
    // picsum.photos: placeholder photography on the /assinar sales page.
    `img-src 'self' data: blob: https://www.facebook.com https://picsum.photos https://fastly.picsum.photos`,
    `font-src 'self'`,
    // Meta Pixel's own script makes its tracking calls to these two hosts.
    `connect-src 'self' https://www.facebook.com https://connect.facebook.net`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`
  ].join('; ');
}

export function middleware(request: NextRequest) {
  // btoa/crypto.randomUUID are Web-standard APIs available in the Edge
  // Runtime middleware actually runs in — Buffer (Node.js-only) is NOT
  // available here and throws on every single request if used.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  // Cloudflare already terminates TLS in front of this app and redirects
  // http->https; this header just makes browsers enforce it directly too.
  // No includeSubDomains/preload — this app doesn't control what else runs
  // under other zghost.uk subdomains.
  response.headers.set('Strict-Transport-Security', 'max-age=31536000');

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimization files —
    // those are immutable/hashed and don't need per-request CSP nonces.
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
