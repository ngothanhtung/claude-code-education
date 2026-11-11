import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Alkene (KHTN 9, Bài 24)
 * lop-9 / hoa-hoc / hydrocarbon
 * n: số mol khí; pct: % thể tích C₂H₄ trong hỗn hợp (tạo khối lượng Br₂ cho trong đề).
 */
export const EXERCISES: Params[] = [
  { mode: 'brom', mol: 'C2H4', n: 0.1, pct: 25, mass: 1, H: 90 },
  { mode: 'honhop', mol: 'C2H4', n: 0.2, pct: 25, mass: 1, H: 90 },
  { mode: 'dot', mol: 'C2H4', n: 0.1, pct: 25, mass: 1, H: 90 },
  { mode: 'trunghop', mol: 'C2H4', n: 0.1, pct: 25, mass: 1, H: 90 },
  { mode: 'brom', mol: 'C3H6', n: 0.1, pct: 25, mass: 1, H: 90 },
];
