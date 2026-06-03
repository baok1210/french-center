'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

const DEMO_CREDENTIALS = [
  { role: 'Giáo viên', email: 'teacher@demo.com', password: 'demo1234' },
  { role: 'Học viên', email: 'student@demo.com', password: 'demo1234' },
  { role: 'Quản trị', email: 'admin@demo.com', password: 'demo1234' },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  function handleDemo(email: string) {
    localStorage.setItem('demo_user', email);
    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Login Card */}
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
              FC
            </div>
            <h1 className="text-xl font-semibold tracking-tight">French Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">Đăng nhập hệ thống đánh giá</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mật khẩu</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
              <LogIn className="h-4 w-4" strokeWidth={1.5} />
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link href="/signup"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80">
              <UserPlus className="h-3 w-3" strokeWidth={1.5} />
              Chưa có tài khoản? Đăng ký
            </Link>
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
            >
              {showDemo ? 'Ẩn tài khoản dùng thử' : 'Xem tài khoản dùng thử'}
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        {showDemo && (
          <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tài khoản dùng thử
            </p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((acc) => (
                <div
                  key={acc.email}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
                  onClick={() => handleDemo(acc.email)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-xs font-bold text-primary">{acc.role.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{acc.role}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {acc.email} / {acc.password}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Vào ngay
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
