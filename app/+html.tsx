import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Open Graph / Discord / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sudoloser.github.io/echo/" />
        <meta property="og:title" content="Echo - Minimalist Lyric Editor" />
        <meta property="og:description" content="A minimalist, open-source lyric editor for creating, syncing, and publishing time-tagged lyrics to LRCLIB." />
        <meta property="og:image" content="https://sudoloser.github.io/echo/echo.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://sudoloser.github.io/echo/" />
        <meta name="twitter:title" content="Echo - Minimalist Lyric Editor" />
        <meta name="twitter:description" content="A minimalist, open-source lyric editor for creating, syncing, and publishing time-tagged lyrics to LRCLIB." />
        <meta name="twitter:image" content="https://sudoloser.github.io/echo/echo.png" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
