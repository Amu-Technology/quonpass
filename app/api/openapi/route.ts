import { NextResponse } from 'next/server';
import specs from '../../../swagger.config.js';

/**
 * OpenAPI仕様を提供するAPI
 * 
 * @description swagger-jsdocで生成されたOpenAPI仕様をJSON形式で返します
 * @returns {Promise<NextResponse>} OpenAPI仕様のJSON
 */
export async function GET() {
  try {
    return NextResponse.json(specs);
  } catch (error) {
    console.error('Failed to generate OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to generate OpenAPI specification' },
      { status: 500 }
    );
  }
} 