import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Khai thác đá vôi. Công nghiệp silicate (KHTN 9, Bài 34)
 * lop-9 / hoa-hoc / vo-trai-dat
 * Bài toán sản xuất tính theo tỉ lệ khối lượng (tấn, kg), có hàm lượng và hiệu suất.
 */
export const EXERCISES: Params[] = [
  { mode: 'nungvoi', mRaw: 1, pct: 90, H: 100 },
  { mode: 'nungvoi', mRaw: 10, pct: 80, H: 85 },
  { mode: 'toivoi', mRaw: 5.6, pct: 100, H: 100 },
  { mode: 'thuytinh', mRaw: 1.5, pct: 80, H: 100 },
  { mode: 'nungvoi', mRaw: 2, pct: 95, H: 90 },
];
