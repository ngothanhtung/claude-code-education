import type { Metadata } from 'next';
import DienTichLesson from '@/lessons/lop-5/toan/do-luong/dien-tich-tam-giac-hinh-thang/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('dien-tich-tam-giac-hinh-thang').title };

export default function Page() {
  return <DienTichLesson />;
}
