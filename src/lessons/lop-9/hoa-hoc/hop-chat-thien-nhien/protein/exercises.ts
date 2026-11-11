import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Protein (KHTN 9, Bài 31)
 * lop-9 / hoa-hoc / hop-chat-thien-nhien
 * Hàm lượng protein trong thực phẩm là số liệu tham khảo, ghi rõ trong đề.
 */
export const EXERCISES: Params[] = [
  { mode: 'phantram', amino: 'gly', peptide: 'glygly', n: 0.1, body: 45, need: 1.2, food: 'thitbo' },
  { mode: 'phantram', amino: 'ala', peptide: 'glygly', n: 0.1, body: 45, need: 1.2, food: 'thitbo' },
  { mode: 'thuyphan', amino: 'gly', peptide: 'glygly', n: 0.1, body: 45, need: 1.2, food: 'thitbo' },
  { mode: 'thuyphan', amino: 'gly', peptide: 'glyglygly', n: 0.1, body: 45, need: 1.2, food: 'thitbo' },
  { mode: 'nhucau', amino: 'gly', peptide: 'glygly', n: 0.1, body: 45, need: 1.2, food: 'ca' },
];
