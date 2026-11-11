import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Cảm ứng điện từ, dòng điện xoay chiều
 * lop-9 / vat-ly / dien-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'namcham', pole: 'N', speed: 2, turns: 500, n: 50, time: 10 },
  { mode: 'namcham', pole: 'S', speed: 4, turns: 1000, n: 50, time: 10 },
  { mode: 'xoaychieu', pole: 'N', speed: 2, turns: 500, n: 50, time: 10 },
  { mode: 'xoaychieu', pole: 'N', speed: 2, turns: 500, n: 25, time: 4 },
  { mode: 'xoaychieu', pole: 'N', speed: 2, turns: 500, n: 60, time: 30 },
];
