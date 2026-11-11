import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Lipid (KHTN 9, Bài 28)
 * lop-9 / hoa-hoc / hop-chat-thien-nhien
 * n: số mol chất béo; đề hiển thị khối lượng (tristearin M = 890, tripalmitin 806, triolein 884).
 */
export const EXERCISES: Params[] = [
  { mode: 'xaphong', fat: 'stearin', n: 0.02, H: 100 },
  { mode: 'xaphong', fat: 'palmitin', n: 0.01, H: 100 },
  { mode: 'xaphong', fat: 'olein', n: 0.05, H: 100 },
  { mode: 'xaphong', fat: 'stearin', n: 0.1, H: 80 },
  { mode: 'baotoan', fat: 'stearin', n: 0.1, H: 100 },
];
