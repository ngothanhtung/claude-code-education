import type { Metadata } from 'next';
import TinhBotCelluloseLesson from '@/lessons/lop-9/hoa-hoc/hop-chat-thien-nhien/tinh-bot-cellulose/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('tinh-bot-cellulose').title };

export default function Page() {
  return <TinhBotCelluloseLesson />;
}
