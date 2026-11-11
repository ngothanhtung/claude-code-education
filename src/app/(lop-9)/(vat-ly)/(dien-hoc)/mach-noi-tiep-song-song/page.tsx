import type { Metadata } from 'next';
import MachDienLesson from '@/lessons/lop-9/vat-ly/dien-hoc/mach-noi-tiep-song-song/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('mach-noi-tiep-song-song').title };

export default function Page() {
  return <MachDienLesson />;
}
