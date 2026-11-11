import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Công suất điện
 * lop-9 / vat-ly / dien-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'IR', U: 220, P: 100, I: 0.5 },
  { mode: 'IR', U: 6, P: 3, I: 0.5 },
  { mode: 'IR', U: 12, P: 24, I: 0.5 },
  { mode: 'P', U: 220, P: 100, I: 0.5 },
  { mode: 'P', U: 12, P: 100, I: 1.5 },
];
