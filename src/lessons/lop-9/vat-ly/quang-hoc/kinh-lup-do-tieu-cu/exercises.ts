import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Kính lúp và đo tiêu cự thấu kính
 * lop-9 / vat-ly / quang-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'kinhlup', f: 5, d: 4, lens: 'k2', bd: 30, bdp: 30 },
  { mode: 'kinhlup', f: 10, d: 6, lens: 'k2', bd: 30, bdp: 30 },
  { mode: 'kinhlup', f: 12.5, d: 10, lens: 'k2', bd: 30, bdp: 30 },
  { mode: 'dotieucu', f: 5, d: 4, lens: 'k1', bd: 20, bdp: 20 },
  { mode: 'dotieucu', f: 5, d: 4, lens: 'k3', bd: 30, bdp: 30 },
];
