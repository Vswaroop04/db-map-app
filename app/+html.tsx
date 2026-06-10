import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <style>{`
          .map-pin-tooltip {
            background: rgba(17,24,39,0.9);
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            padding: 3px 8px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .map-pin-tooltip::before { display: none; }
          .leaflet-tooltip-top.map-pin-tooltip::before { display: none; }
        `}</style>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
