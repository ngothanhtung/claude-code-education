import { Be_Vietnam_Pro, Noto_Serif } from 'next/font/google';

/**
 * Hai phông dùng chung cho mọi cấp học (Lớp 5, Lớp 9…), đều có đủ dấu tiếng Việt:
 *  - uiFont:   giao diện, đề bài, nút, nhãn trên hình vẽ
 *  - bookFont: chữ trình bày kiểu SGK – vở "Bài giải", mục "Cần nhớ", chữ và đơn vị trong công thức
 */
export const uiFont = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

export const bookFont = Noto_Serif({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-book',
  display: 'swap',
});
