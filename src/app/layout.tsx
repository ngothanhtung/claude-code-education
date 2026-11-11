import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { handFont, uiFont } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Mô phỏng Toán lớp 5',
    template: '%s – Toán 5',
  },
  description:
    'Mô phỏng tương tác Toán lớp 5: bài toán chuyển động (vận tốc, giờ đến nơi, ngược chiều, cùng chiều) và đo lường (đổi đơn vị, diện tích, hình tròn, thể tích).',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${uiFont.variable} ${handFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
