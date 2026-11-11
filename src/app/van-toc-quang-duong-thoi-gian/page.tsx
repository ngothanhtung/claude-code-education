import type { Metadata } from 'next';
import VanTocLesson from '@/lessons/van-toc-quang-duong-thoi-gian/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('van-toc-quang-duong-thoi-gian').title };

export default function Page() {
  return <VanTocLesson />;
}
