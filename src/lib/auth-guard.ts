'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('demo_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.role) {
          setRole(parsed.role);
          if (!allowedRoles.includes(parsed.role)) {
            router.push('/dashboard');
            return;
          }
          setChecking(false);
          return;
        }
      } catch {}
      // Legacy
      const m: Record<string, string> = { 'admin@demo.com': 'Admin', 'teacher@demo.com': 'TeacherTA' };
      const r = m[raw] || 'Student';
      setRole(r);
      if (!allowedRoles.includes(r)) {
        router.push('/dashboard');
        return;
      }
      setChecking(false);
      return;
    }
    // No demo user — let middleware handle it, but redirect anyway
    router.push('/login');
  }, []);

  return { checking, role };
}
