import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Alkane (KHTN 9, Bài 23)
 * lop-9 / hoa-hoc / hydrocarbon
 * n là số mol alkane; đề hiển thị thể tích (đkc) hoặc khối lượng tương ứng.
 */
export const EXERCISES: Params[] = [
  { mode: 'dot', mol: 'CH4', given: 'V', n: 0.2 },
  { mode: 'dot', mol: 'C3H8', given: 'm', n: 0.1 },
  { mode: 'dot', mol: 'C2H6', given: 'm', n: 0.1 },
  { mode: 'the', mol: 'CH4', given: 'V', n: 0.25 },
  { mode: 'dot', mol: 'C4H10', given: 'm', n: 0.2 },
];
