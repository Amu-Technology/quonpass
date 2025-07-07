'use client';

import { useEffect } from 'react';

export default function ApiDocsPage() {
  useEffect(() => {
    // redocを動的に読み込み
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js';
    script.onload = () => {
      // @ts-expect-error - Redoc is loaded dynamically
      if (window.Redoc) {
        // @ts-expect-error - Redoc is loaded dynamically
        window.Redoc.init('/api/openapi', {
          scrollYOffset: 0,
          hideDownloadButton: true,
          theme: {
            colors: {
              primary: {
                main: '#3b82f6'
              }
            },
            typography: {
              fontSize: '14px',
              lineHeight: '1.5em',
              code: {
                fontSize: '13px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace'
              }
            }
          }
        }, document.getElementById('redoc'));
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      <head>
        <title>QuonPass API Documentation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <div style={{ margin: 0, height: '100vh' }}>
        <div id="redoc"></div>
      </div>
    </>
  );
} 