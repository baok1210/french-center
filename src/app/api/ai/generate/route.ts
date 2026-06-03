import { NextRequest, NextResponse } from 'next/server';
import { buildGeneratePrompt, callOpenAI } from '@/lib/ai';
import type { GenerateRequest } from '@/types/ai';

export async function POST(req: NextRequest) {
  const { type, level, apiKey } = await req.json() as GenerateRequest & { apiKey?: string };

  const messages = buildGeneratePrompt(type, level);
  const result = await callOpenAI(messages, apiKey);

  if (!result) {
    return NextResponse.json(
      { error: 'Open AI hiện đang quá tải. Vui lòng thử lại sau.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ content: result });
}
