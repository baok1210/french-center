'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const demoEmail = localStorage.getItem('demo_user');
    if (demoEmail === 'student@demo.com') {
      router.replace('/knowledge');
    } else if (demoEmail) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-muted-foreground animate-pulse">Đang chuyển hướng...</div>
    </div>
  );
}
