import type { Metadata } from 'next';
import GlucoseSaccharoseLesson from '@/lessons/lop-9/hoa-hoc/hop-chat-thien-nhien/glucose-saccharose/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('glucose-saccharose').title };

export default function Page() {
  return <GlucoseSaccharoseLesson />;
}
