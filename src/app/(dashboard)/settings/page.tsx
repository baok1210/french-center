'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Globe, Save, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SETTINGS_KEYS = {
  openai: 'app_settings_openai_key',
  google: 'app_settings_google_key',
};

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  useEffect(() => {
    setOpenaiKey(localStorage.getItem(SETTINGS_KEYS.openai) || '');
    setGoogleKey(localStorage.getItem(SETTINGS_KEYS.google) || '');
  }, []);

  function handleSave() {
    localStorage.setItem(SETTINGS_KEYS.openai, openaiKey);
    localStorage.setItem(SETTINGS_KEYS.google, googleKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Settings className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Cài đặt</h2>
          <p className="text-sm text-muted-foreground">Cấu hình API keys và các thiết lập hệ thống</p>
        </div>
      </div>

      {/* OpenAI Key */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Key className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">OpenAI API Key</h3>
            <p className="text-xs text-muted-foreground">
              Dùng cho Trợ lý AI, dịch thuật và sinh văn bản. Key được lưu trên trình duyệt của bạn.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative">
            <input
              type={showOpenai ? 'text' : 'password'}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowOpenai(!showOpenai)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {!openaiKey && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
              Chưa cấu hình — Trợ lý AI sẽ không hoạt động
            </p>
          )}
        </div>
      </div>

      {/* Google Translate Key */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Google Translate API Key</h3>
            <p className="text-xs text-muted-foreground">
              Dùng cho tính năng dịch thuật. Không bắt buộc — sẽ dùng bản miễn phí nếu để trống.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative">
            <input
              type={showGoogle ? 'text' : 'password'}
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="Để trống nếu không dùng"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowGoogle(!showGoogle)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showGoogle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
            Đã lưu cài đặt
          </span>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Save className="h-4 w-4" strokeWidth={1.5} />
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
