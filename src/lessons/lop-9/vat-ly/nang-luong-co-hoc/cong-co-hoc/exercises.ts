import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Công cơ học
 * lop-9 / vat-ly / nang-luong-co-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'keo', actor: 'một người', thing: 'thùng hàng', wheels: false, F: 200, s: 15, m: 50, h: 2, A: 3000 },
  { mode: 'keo', actor: 'một con ngựa', thing: 'xe', wheels: true, F: 600, s: 400, m: 50, h: 2, A: 3000 },
  { mode: 'nang', actor: 'một cần cẩu', thing: 'thùng hàng', wheels: false, F: 200, s: 15, m: 300, h: 12, A: 3000 },
  { mode: 'nang', actor: 'một người công nhân', thing: 'bao gạo', wheels: false, F: 200, s: 15, m: 50, h: 1.5, A: 3000 },
  { mode: 'luc', actor: 'một bạn học sinh', thing: 'xe trượt', wheels: true, F: 200, s: 30, m: 50, h: 2, A: 4500 },
];
