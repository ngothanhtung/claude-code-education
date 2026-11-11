import type { Metadata } from 'next';
import PolymerLesson from '@/lessons/lop-9/hoa-hoc/hop-chat-thien-nhien/polymer/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('polymer').title };

export default function Page() {
  return <PolymerLesson />;
}
