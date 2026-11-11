import type { Metadata } from 'next';
import DaVoiSilicateLesson from '@/lessons/lop-9/hoa-hoc/vo-trai-dat/da-voi-silicate/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('da-voi-silicate').title };

export default function Page() {
  return <DaVoiSilicateLesson />;
}
