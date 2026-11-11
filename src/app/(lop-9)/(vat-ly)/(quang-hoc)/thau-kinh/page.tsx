import type { Metadata } from 'next';
import ThauKinhLesson from '@/lessons/lop-9/vat-ly/quang-hoc/thau-kinh/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('thau-kinh').title };

export default function Page() {
  return <ThauKinhLesson />;
}
