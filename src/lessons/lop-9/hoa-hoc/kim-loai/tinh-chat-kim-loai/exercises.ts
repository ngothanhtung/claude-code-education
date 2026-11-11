import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Tính chất hóa học chung của kim loại (KHTN 9, Bài 18)
 * lop-9 / hoa-hoc / kim-loai
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'oxi', metal: 'Mg', acid: 'HCl', m: 2.4 },
  { mode: 'oxi', metal: 'Fe', acid: 'HCl', m: 16.8 },
  { mode: 'clo', metal: 'Fe', acid: 'HCl', m: 5.6 },
  { mode: 'acid', metal: 'Zn', acid: 'HCl', m: 6.5 },
  { mode: 'acid', metal: 'Al', acid: 'H2SO4', m: 5.4 },
];
