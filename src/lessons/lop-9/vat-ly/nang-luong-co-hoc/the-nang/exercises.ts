import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Thế năng trọng trường
 * lop-9 / vat-ly / nang-luong-co-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { mode: 'W', name: 'thùng hàng', shape: 'box', m: 20, h: 3, W: 600, hb: 0.8 },
  { mode: 'W', name: 'quả dừa', shape: 'ball', m: 1.5, h: 8, W: 120, hb: 0.8 },
  { mode: 'h', name: 'vật', shape: 'box', m: 2, h: 5, W: 100, hb: 0.8 },
  { mode: 'm', name: 'bao xi măng', shape: 'box', m: 15, h: 6, W: 900, hb: 0.8 },
  { mode: 'moc', name: 'chậu cây', shape: 'box', m: 0.5, h: 2, W: 10, hb: 0.8 },
];
