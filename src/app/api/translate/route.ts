import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, source, target, apiKey: clientKey } = await req.json() as {
    text: string;
    source: string;
    target: string;
    apiKey?: string;
  };

  const apiKey = clientKey || process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    // Fallback: use a free translation API
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
      );
      const data = await res.json();
      return NextResponse.json({
        translatedText: data.responseData?.translatedText ?? text,
      });
    } catch {
      return NextResponse.json(
        { error: 'Translation service unavailable.' },
        { status: 503 }
      );
    }
  }

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source, target, format: 'text' }),
      }
    );
    const data = await res.json();
    return NextResponse.json({
      translatedText: data.data?.translations?.[0]?.translatedText ?? text,
    });
  } catch {
    return NextResponse.json(
      { error: 'Translation service unavailable.' },
      { status: 503 }
    );
  }
}
