import { notFound, redirect } from 'next/navigation';
import { SUBJECTS, getGrade, gradeByNo, subjectBySlug, subjectHref } from '@/lib/lessons';

type Props = { params: Promise<{ class: string; subject: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ class: getGrade(s.grade).no, subject: s.slug }));
}

/** …/<môn>/topics → trang của môn (đã liệt kê các chủ đề) */
export default async function TopicsPage({ params }: Props) {
  const p = await params;
  const grade = gradeByNo(p.class);
  const subject = grade && subjectBySlug(grade.id, p.subject);
  if (!subject) notFound();
  redirect(subjectHref(subject.id));
}
