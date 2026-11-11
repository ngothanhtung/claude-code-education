import type { Metadata } from 'next';
import CoNangLesson from '@/lessons/lop-9/vat-ly/nang-luong-co-hoc/co-nang/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('co-nang').title };

export default function Page() {
  return <CoNangLesson />;
}
