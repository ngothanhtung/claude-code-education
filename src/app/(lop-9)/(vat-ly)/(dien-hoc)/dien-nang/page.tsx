import type { Metadata } from 'next';
import DienNangLesson from '@/lessons/lop-9/vat-ly/dien-hoc/dien-nang/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('dien-nang').title };

export default function Page() {
  return <DienNangLesson />;
}
