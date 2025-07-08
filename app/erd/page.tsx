'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download } from 'lucide-react';

export default function ERDPage() {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchERD = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/erd');
      if (!response.ok) {
        throw new Error('ER図の取得に失敗しました');
      }
      
      const svg = await response.text();
      setSvgContent(svg);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const downloadERD = () => {
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quonpass-erd.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    fetchERD();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">データベース設計図 (ER図)</h1>
        <p className="text-gray-600">
          Prismaスキーマから自動生成されたデータベースのER図です。
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entity Relationship Diagram</CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={fetchERD}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                更新
              </Button>
              <Button
                onClick={downloadERD}
                disabled={!svgContent}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                SVGダウンロード
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>ER図を生成中...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchERD} variant="outline">
                  再試行
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && svgContent && (
            <div className="border rounded-lg overflow-auto bg-white">
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>注意:</strong> ER図はPrismaスキーマの変更時に自動的に更新されます。
          最新の状態を確認するには「更新」ボタンをクリックしてください。
        </p>
      </div>
    </div>
  );
} 