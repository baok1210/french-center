'use client';

import { useState } from 'react';
import { AiChat, TextGenerator, Translator } from '@/components/ai';
import { MessageSquare, Sparkles, Languages, Settings } from 'lucide-react';
import Link from 'next/link';

const TABS = [
  { key: 'chat', label: 'Trò chuyện', icon: MessageSquare, component: 'AiChat' },
  { key: 'generate', label: 'Sinh văn bản', icon: Sparkles, component: 'TextGenerator' },
  { key: 'translate', label: 'Dịch thuật', icon: Languages, component: 'Translator' },
];

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState('chat');

  const hasApiKey = typeof window !== 'undefined' && !!localStorage.getItem('app_settings_openai_key');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Trợ lý AI tiếng Pháp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Học tiếng Pháp với AI — trò chuyện, sinh văn bản, dịch thuật.
        </p>
      </div>

      {/* API Key Warning */}
      <div className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 ${
        hasApiKey ? 'bg-success/5 text-success' : 'bg-destructive/5 text-destructive'
      }`}>
        {hasApiKey ? (
          <>
            <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span className="text-sm font-medium">Đã cấu hình OpenAI API key</span>
          </>
        ) : (
          <>
            <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span className="text-sm">
              Chưa cấu hình API key.{' '}
              <Link href="/settings" className="font-semibold underline">
                Vào Cài đặt để thêm
              </Link>
            </span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-border/50 bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'chat' && <AiChat />}
        {activeTab === 'generate' && <TextGenerator />}
        {activeTab === 'translate' && <Translator />}
      </div>
    </div>
  );
}
