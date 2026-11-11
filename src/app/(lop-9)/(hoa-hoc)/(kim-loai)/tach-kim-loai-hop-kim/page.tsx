import type { Metadata } from 'next';
import TachKimLoaiLesson from '@/lessons/lop-9/hoa-hoc/kim-loai/tach-kim-loai-hop-kim/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('tach-kim-loai-hop-kim').title };

export default function Page() {
  return <TachKimLoaiLesson />;
}
