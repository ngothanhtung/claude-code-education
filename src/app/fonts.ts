import { Be_Vietnam_Pro, Patrick_Hand } from 'next/font/google';

/** Font giao diện – thiết kế riêng cho dấu tiếng Việt */
export const uiFont = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

/** Font chữ viết tay cho vở "Bài giải" */
export const handFont = Patrick_Hand({
  subsets: ['vietnamese', 'latin'],
  weight: '400',
  variable: '--font-hand',
  display: 'swap',
});
