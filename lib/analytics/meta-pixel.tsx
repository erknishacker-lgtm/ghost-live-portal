import Script from 'next/script';

export const GHOST_LIVE_META_PIXEL_ID = '1579134963854260';

type PixelEvent = {
  name: string;
  params?: Record<string, string | number>;
};

/**
 * Server Component — reads the per-request CSP nonce (set on the request
 * headers by middleware.ts) and stamps it on the inline bootstrap script.
 * Without the nonce, our CSP (script-src 'nonce-...' 'strict-dynamic') would
 * silently block this script from ever running.
 */
export function MetaPixel({ nonce, pixelId, events }: { nonce: string; pixelId: string; events: PixelEvent[] }) {
  const trackCalls = events
    .map((event) => `fbq('track', '${event.name}'${event.params ? `, ${JSON.stringify(event.params)}` : ''});`)
    .join('\n');

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive" nonce={nonce}>
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
${trackCalls}`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=${events[0]?.name ?? 'PageView'}&noscript=1`}
        />
      </noscript>
    </>
  );
}
