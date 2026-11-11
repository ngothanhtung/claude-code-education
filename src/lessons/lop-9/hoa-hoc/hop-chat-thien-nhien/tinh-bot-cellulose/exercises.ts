import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Tinh bột và cellulose (KHTN 9, Bài 30)
 * lop-9 / hoa-hoc / hop-chat-thien-nhien
 * Bài toán sản xuất tính theo tỉ lệ khối lượng; n dùng cho dạng quang hợp (mol mắt xích).
 */
export const EXERCISES: Params[] = [
  { mode: 'thuyphan', raw: 'tinhbot', mRaw: 1, pct: 100, H: 80, unit: 'tấn', n: 0.1 },
  { mode: 'thuyphan', raw: 'munca', mRaw: 32.4, pct: 50, H: 70, unit: 'kg', n: 0.1 },
  { mode: 'ruou', raw: 'gao', mRaw: 1, pct: 81, H: 75, unit: 'tấn', n: 0.1 },
  { mode: 'quanghop', raw: 'tinhbot', mRaw: 1, pct: 100, H: 80, unit: 'tấn', n: 0.1 },
  { mode: 'ruou', raw: 'ngo', mRaw: 10, pct: 65, H: 80, unit: 'kg', n: 0.1 },
];
