import type { Metadata } from 'next';
import TheTichLesson from '@/lessons/lop-5/toan/do-luong/the-tich-hinh-hop/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('the-tich-hinh-hop').title };

export default function Page() {
  return <TheTichLesson />;
}
