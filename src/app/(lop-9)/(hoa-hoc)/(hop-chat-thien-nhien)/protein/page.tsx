import type { Metadata } from 'next';
import ProteinLesson from '@/lessons/lop-9/hoa-hoc/hop-chat-thien-nhien/protein/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('protein').title };

export default function Page() {
  return <ProteinLesson />;
}
