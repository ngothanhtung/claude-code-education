import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogHead, Tabs, TeacherTip, TopicMasonry } from '@/components/Catalog';
import {
  SUBJECTS, classHref, getGrade, gradeByNo, lessonsOf, subjectBySlug, topicHref, topicsOf,
} from '@/lib/lessons';

type Props = { params: Promise<{ class: string; subject: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ class: getGrade(s.grade).no, subject: s.slug }));
}

async function resolve(params: Props['params']) {
  const p = await params;
  const grade = gradeByNo(p.class);
  const subject = grade && subjectBySlug(grade.id, p.subject);
  return grade && subject ? { grade, subject } : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  return { title: r ? `${r.subject.title} ${r.grade.no} – Các chủ đề` : 'Không tìm thấy môn' };
}

/** Một môn: các chủ đề dạng thẻ (shadcn Card) xếp masonry, mỗi thẻ liệt kê các bài */
export default async function SubjectPage({ params }: Props) {
  const r = await resolve(params);
  if (!r) notFound();
  const { grade, subject } = r;
  const topics = topicsOf(subject.id);

  return (
    <main className="sheet">
      <CatalogHead
        crumbs={[
          { label: 'Chọn lớp', href: '/' },
          { label: grade.title, href: classHref(grade.id) },
          { label: subject.title },
        ]}
        title={`${subject.title} ${grade.no}`}
        intro={subject.note || 'Chọn một chủ đề hoặc mở ngay một bài bên dưới.'}
      >
        <Tabs label="Các chủ đề" variant="topic"
          items={topics.map((t) => ({ key: t.id, label: `${t.title} (${lessonsOf(t.id).length})`, href: topicHref(t.id) }))} />
      </CatalogHead>

      <TopicMasonry topics={topics.map((t) => t.id)} />

      <TeacherTip />
    </main>
  );
}
