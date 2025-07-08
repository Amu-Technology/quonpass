import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * @swagger
 * /api/erd:
 *   get:
 *     summary: ER図を取得するAPI
 *     description: PrismaスキーマからER図を生成してSVG形式で返します
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: ER図の取得に成功
 *         content:
 *           image/svg+xml:
 *             schema:
 *               type: string
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    const erdPath = path.join(process.cwd(), 'public', 'erd.svg');
    
    // ER図ファイルが存在しない場合は生成
    if (!fs.existsSync(erdPath)) {
      console.log('ER図を生成中...');
      await execAsync('npx prisma generate');
      console.log('ER図の生成が完了しました');
    }

    // ER図ファイルを読み込み
    if (fs.existsSync(erdPath)) {
      const svgContent = fs.readFileSync(erdPath, 'utf-8');
      return new NextResponse(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
        },
      });
    } else {
      throw new Error('ER図の生成に失敗しました');
    }
  } catch (error) {
    console.error('ER図の生成エラー:', error);
    return NextResponse.json(
      { error: 'ER図の生成に失敗しました' },
      { status: 500 }
    );
  }
} 