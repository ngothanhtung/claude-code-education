import type { Metadata } from 'next';
import TheNangLesson from '@/lessons/lop-9/vat-ly/nang-luong-co-hoc/the-nang/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('the-nang').title };

export default function Page() {
  return <TheNangLesson />;
}
