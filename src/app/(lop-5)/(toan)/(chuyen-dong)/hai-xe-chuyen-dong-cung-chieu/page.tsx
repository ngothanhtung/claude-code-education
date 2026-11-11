import type { Metadata } from 'next';
import CungChieuLesson from '@/lessons/lop-5/toan/chuyen-dong/hai-xe-chuyen-dong-cung-chieu/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('hai-xe-chuyen-dong-cung-chieu').title };

export default function Page() {
  return <CungChieuLesson />;
}
