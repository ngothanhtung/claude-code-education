import type { Metadata } from 'next';
import KimLoaiPhiKimLesson from '@/lessons/lop-9/hoa-hoc/kim-loai/kim-loai-va-phi-kim/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('kim-loai-va-phi-kim').title };

export default function Page() {
  return <KimLoaiPhiKimLesson />;
}
