import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/ai';
import type { ChatMessage } from '@/types/ai';

export async function POST(req: NextRequest) {
  const { messages, question, apiKey } = await req.json() as {
    messages: ChatMessage[];
    question: string;
    apiKey?: string;
  };

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: 'You are a native French speaker and are also bilingual in English from birth. You are extremely competent in both languages as well as how to translate between them. You are also especially competent in helping students learn French.' },
    ...(messages ?? []),
    { role: 'user', content: question },
  ];

  const result = await callOpenAI(chatMessages, apiKey);
  if (!result) {
    return NextResponse.json(
      { error: 'Open AI hiện đang quá tải. Vui lòng thử lại sau.' },
      { status: 503 }
    );
  }

  const updatedMessages: ChatMessage[] = [
    ...(messages ?? []),
    { role: 'user', content: question },
    { role: 'assistant', content: result },
  ];

  return NextResponse.json({ message: result, messages: updatedMessages });
}
