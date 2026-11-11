import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Điện năng, tiền điện
 * lop-9 / vat-ly / dien-hoc
 * Mỗi bài tập là một bộ số liệu đầy đủ (kể cả dạng đề); giữ giá trị trong khoảng của thanh trượt.
 */
export const EXERCISES: Params[] = [
  { device: 'ấm điện', P: 1000, hours: 0.5, days: 30, price: 2000 },
  { device: 'nồi cơm điện', P: 800, hours: 1, days: 30, price: 1800 },
  { device: 'quạt điện', P: 100, hours: 8, days: 30, price: 2000 },
  { device: 'máy điều hòa', P: 1200, hours: 6, days: 30, price: 2500 },
  { device: 'bàn là', P: 1100, hours: 2, days: 15, price: 3000 },
];
