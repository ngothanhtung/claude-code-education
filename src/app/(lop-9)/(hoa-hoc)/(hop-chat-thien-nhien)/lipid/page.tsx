import type { Metadata } from 'next';
import LipidLesson from '@/lessons/lop-9/hoa-hoc/hop-chat-thien-nhien/lipid/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('lipid').title };

export default function Page() {
  return <LipidLesson />;
}
