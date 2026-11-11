import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import { bookFont, uiFont } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Vở mô phỏng: Toán lớp 5, Vật lý lớp 9',
    template: '%s – Vở mô phỏng',
  },
  description:
    'Mô phỏng tương tác cho Toán lớp 5 (chuyển động, đo lường) và Vật lý lớp 9 (năng lượng cơ học, quang học).',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${uiFont.variable} ${bookFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
