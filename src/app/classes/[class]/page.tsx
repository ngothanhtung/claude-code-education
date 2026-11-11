import { notFound, redirect } from 'next/navigation';
import { GRADES, classHref, gradeByNo } from '@/lib/lessons';

type Props = { params: Promise<{ class: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GRADES.map((g) => ({ class: g.no }));
}

/** /classes/<no> → /classes/<no>/subjects */
export default async function ClassPage({ params }: Props) {
  const grade = gradeByNo((await params).class);
  if (!grade) notFound();
  redirect(classHref(grade.id));
}
