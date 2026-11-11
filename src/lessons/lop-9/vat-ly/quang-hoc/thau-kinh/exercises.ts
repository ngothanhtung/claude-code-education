import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Thấu kính hội tụ, thấu kính phân kỳ
 * lop-9 / vat-ly / quang-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { type: 'hoitu', f: 12, d: 36, h: 2 },
  { type: 'hoitu', f: 10, d: 20, h: 3 },
  { type: 'hoitu', f: 10, d: 15, h: 2 },
  { type: 'hoitu', f: 12, d: 8, h: 2 },
  { type: 'phanky', f: 12, d: 24, h: 3 },
];
