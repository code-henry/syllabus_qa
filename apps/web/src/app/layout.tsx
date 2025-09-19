import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Syllabus-QA',
  description: 'Q&A with citations from syllabus guidance',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
