'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { UserPlus, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;
    const fullName = form.get('full_name') as string;
    const confirm = form.get('confirm_password') as string;

    if (password !== confirm) {
      setError('Mật khẩu không khớp');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess('Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
              FC
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Đăng ký</h1>
            <p className="mt-1 text-sm text-muted-foreground">Tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Họ và tên</label>
              <input name="full_name" type="text" required
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <input name="email" type="email" required
                placeholder="your@email.com"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mật khẩu</label>
              <input name="password" type="password" required minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Xác nhận mật khẩu</label>
              <input name="confirm_password" type="password" required minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-success/5 px-3 py-2.5 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
              <UserPlus className="h-4 w-4" strokeWidth={1.5} />
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">
              <LogIn className="h-3 w-3" strokeWidth={1.5} />
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
