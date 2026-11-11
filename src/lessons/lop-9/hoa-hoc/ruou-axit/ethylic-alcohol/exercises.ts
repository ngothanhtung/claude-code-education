import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Ethylic alcohol (KHTN 9, Bài 26)
 * lop-9 / hoa-hoc / ruou-axit
 * n: số mol ethylic alcohol (đốt cháy, sodium) hoặc glucose (lên men); đề hiển thị khối lượng.
 */
export const EXERCISES: Params[] = [
  { mode: 'dot', n: 0.2, Vdd: 500, deg: 40, H: 80 },
  { mode: 'na', n: 0.1, Vdd: 500, deg: 40, H: 80 },
  { mode: 'docon', n: 0.1, Vdd: 500, deg: 40, H: 80 },
  { mode: 'docon', n: 0.1, Vdd: 330, deg: 5, H: 80 },
  { mode: 'lenmen', n: 1, Vdd: 500, deg: 40, H: 80 },
];
