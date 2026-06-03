import type { ChatMessage, FrenchLevel, GenerateType } from '@/types/ai';
import { PROMPTS } from '@/data/prompts';
import { LEVEL_DESCRIPTIONS } from '@/data/levels';

export function buildChatMessages(question: string): ChatMessage[] {
  return [
    { role: 'system', content: PROMPTS.context },
    { role: 'user', content: question },
  ];
}

export function buildGeneratePrompt(
  type: GenerateType,
  level: FrenchLevel
): ChatMessage[] {
  const key = `generate${type}` as keyof typeof PROMPTS;
  const template = PROMPTS[key] as { instructions: string; substituteContext: string };

  const levelDesc = LEVEL_DESCRIPTIONS[level];
  const userPrompt =
    template.instructions +
    '\n\n' +
    levelDesc +
    template.substituteContext.replace('{level}', levelDesc);

  return [
    { role: 'system', content: PROMPTS.context },
    { role: 'user', content: userPrompt },
  ];
}

export async function callOpenAI(
  messages: ChatMessage[],
  apiKey?: string
): Promise<string | null> {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    return 'OPENAI_API_KEY chưa được cấu hình. Vào Cài đặt để thêm API key.';
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('OpenAI API error:', err);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error('OpenAI fetch error:', err);
    return null;
  }
}
