import { ScrollViewStyleReset } from 'expo-router/html';
import Constants from 'expo-constants';
import type { PropsWithChildren } from 'react';

const basePath = Constants.expoConfig?.experiments?.baseUrl?.replace(/\/$/, '') ?? '';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${basePath}/apple-touch-icon.png`}
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                height: 100%;
              }
              body {
                margin: 0;
                background: #ffffff;
                -webkit-tap-highlight-color: transparent;
              }
              .library-doc-card,
              .library-doc-card * {
                -webkit-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
              }
              .library-doc-card img {
                -webkit-user-drag: none;
                pointer-events: none;
              }
              body.claridad-no-select,
              body.claridad-no-select *:not(input):not(textarea) {
                -webkit-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
              }
              .library-action-sheet,
              .library-action-sheet * {
                -webkit-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
              }
              @media (min-width: 520px) {
                body {
                  background: #111827;
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
