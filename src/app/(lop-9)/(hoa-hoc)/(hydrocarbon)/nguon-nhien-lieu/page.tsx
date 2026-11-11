import type { Metadata } from 'next';
import NguonNhienLieuLesson from '@/lessons/lop-9/hoa-hoc/hydrocarbon/nguon-nhien-lieu/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('nguon-nhien-lieu').title };

export default function Page() {
  return <NguonNhienLieuLesson />;
}
