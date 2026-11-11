import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Glucose và saccharose (KHTN 9, Bài 29)
 * lop-9 / hoa-hoc / hop-chat-thien-nhien
 * n: số mol glucose (saccharose khi thủy phân); đề hiển thị khối lượng.
 */
export const EXERCISES: Params[] = [
  { mode: 'trangbac', n: 0.1, H: 100 },
  { mode: 'trangbac', n: 0.2, H: 75 },
  { mode: 'thuyphan', n: 0.1, H: 100 },
  { mode: 'quanghop', n: 0.5, H: 100 },
  { mode: 'lenmen', n: 2, H: 90 },
];
