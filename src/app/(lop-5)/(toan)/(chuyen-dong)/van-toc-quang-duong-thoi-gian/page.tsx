import type { Metadata } from 'next';
import VanTocLesson from '@/lessons/lop-5/toan/chuyen-dong/van-toc-quang-duong-thoi-gian/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('van-toc-quang-duong-thoi-gian').title };

export default function Page() {
  return <VanTocLesson />;
}
