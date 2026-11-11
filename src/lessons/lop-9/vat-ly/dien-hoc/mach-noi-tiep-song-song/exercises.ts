import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Đoạn mạch nối tiếp, đoạn mạch song song
 * lop-9 / vat-ly / dien-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'noitiep', U: 12, R1: 10, R2: 20 },
  { mode: 'noitiep', U: 6, R1: 4, R2: 8 },
  { mode: 'noitiep', U: 24, R1: 30, R2: 18 },
  { mode: 'songsong', U: 12, R1: 20, R2: 30 },
  { mode: 'songsong', U: 6, R1: 6, R2: 12 },
];
