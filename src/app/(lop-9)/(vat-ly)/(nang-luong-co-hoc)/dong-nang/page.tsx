import type { Metadata } from 'next';
import DongNangLesson from '@/lessons/lop-9/vat-ly/nang-luong-co-hoc/dong-nang/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('dong-nang').title };

export default function Page() {
  return <DongNangLesson />;
}
