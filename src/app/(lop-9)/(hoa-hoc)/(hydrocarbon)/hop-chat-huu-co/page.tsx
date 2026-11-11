import type { Metadata } from 'next';
import HopChatHuuCoLesson from '@/lessons/lop-9/hoa-hoc/hydrocarbon/hop-chat-huu-co/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('hop-chat-huu-co').title };

export default function Page() {
  return <HopChatHuuCoLesson />;
}
