'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ADS = [
  { id: 1, text: 'Bắt đầu bằng lộ trình học cá nhân hóa', link: '/wizard', cta: 'Tạo ngay' },
  { id: 2, text: 'Thẻ flashcard + ôn tập thông minh — Ghi nhớ nhanh hơn', link: '/review', cta: 'Ôn tập' },
];

export default function PromoCarousel() {
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setIdx(prev => (prev + 1) % ADS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  const ad = ADS[idx];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 text-sm">
          <Sparkles className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
          <span className="text-muted-foreground">{ad.text}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={ad.link}
            className="inline-flex items-center gap-1 rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20">
            {ad.cta} <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
          <button onClick={() => setDismissed(true)} className="rounded-lg p-1 text-muted-foreground/50 transition-colors hover:text-muted-foreground">
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
