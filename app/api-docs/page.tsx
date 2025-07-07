'use client';

import { useEffect, useState } from 'react';

/**
 * APIドキュメントページ
 * 
 * @description redocを使用してOpenAPI仕様を表示します
 */
export default function ApiDocsPage() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // OpenAPI仕様を取得
    fetch('/api/openapi')
      .then(response => response.json())
      .then(data => setSpec(data))
      .catch(error => console.error('Failed to load API spec:', error));
  }, []);

  useEffect(() => {
    if (spec) {
      // redocを動的に読み込み
      const script = document.createElement('script');
      script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';
      script.onload = () => {
        // @ts-expect-error - redoc is loaded dynamically
        if (window.Redoc) {
          // @ts-expect-error - redoc is loaded dynamically
          window.Redoc.init(spec, {
            scrollYOffset: 0,
            hideDownloadButton: true,
            theme: {
              colors: {
                primary: {
                  main: '#3b82f6'
                }
              }
            }
          }, document.getElementById('redoc-container'));
        }
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [spec]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">QuonPass API ドキュメント</h1>
        <div id="redoc-container" className="w-full" />
      </div>
    </div>
  );
} 