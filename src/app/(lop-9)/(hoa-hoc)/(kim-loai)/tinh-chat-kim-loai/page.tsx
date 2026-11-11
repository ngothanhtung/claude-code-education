import type { Metadata } from 'next';
import TinhChatKimLoaiLesson from '@/lessons/lop-9/hoa-hoc/kim-loai/tinh-chat-kim-loai/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('tinh-chat-kim-loai').title };

export default function Page() {
  return <TinhChatKimLoaiLesson />;
}
