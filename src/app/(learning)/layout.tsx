'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import PromoCarousel from '@/components/learning/PromoCarousel';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const demoEmail = localStorage.getItem('demo_user');
    if (!demoEmail) {
      router.push('/login');
    } else {
      setAuthed(true);
    }
  }, [router]);

  return (
    <AppShell>
      {authed ? children : null}
      <PromoCarousel />
    </AppShell>
  );
}
