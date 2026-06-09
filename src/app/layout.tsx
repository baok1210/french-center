import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'French Center - Học tiếng Pháp trực tuyến',
  description: 'Nền tảng học tiếng Pháp miễn phí với lộ trình cá nhân hóa, flashcard thông minh và bài tập tương tác.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
