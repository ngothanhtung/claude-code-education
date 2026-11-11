import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Điện trở, định luật Ôm
 * lop-9 / vat-ly / dien-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'I', U: 6, R: 12, I: 0.5, mat: 'nicrom', l: 10, S: 0.5 },
  { mode: 'I', U: 12, R: 30, I: 0.5, mat: 'nicrom', l: 10, S: 0.5 },
  { mode: 'R', U: 9, R: 12, I: 0.3, mat: 'nicrom', l: 10, S: 0.5 },
  { mode: 'R', U: 24, R: 12, I: 1.2, mat: 'nicrom', l: 10, S: 0.5 },
  { mode: 'rho', U: 6, R: 12, I: 0.5, mat: 'dong', l: 50, S: 0.5 },
];
