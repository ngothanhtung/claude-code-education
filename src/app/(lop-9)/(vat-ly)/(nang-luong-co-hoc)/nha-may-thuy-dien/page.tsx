import type { Metadata } from 'next';
import ThuyDienLesson from '@/lessons/lop-9/vat-ly/nang-luong-co-hoc/nha-may-thuy-dien/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('nha-may-thuy-dien').title };

export default function Page() {
  return <ThuyDienLesson />;
}
