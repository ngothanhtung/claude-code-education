import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogHead, LessonCards, Tabs, TeacherTip } from '@/components/Catalog';
import {
  TOPICS, classHref, getGrade, getSubject, gradeByNo, lessonsOf, subjectBySlug, subjectHref, topicHref, topicIn, topicsOf,
} from '@/lib/lessons';

type Props = { params: Promise<{ class: string; subject: string; topic: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => {
    const s = getSubject(t.subject);
    return { class: getGrade(s.grade).no, subject: s.slug, topic: t.id };
  });
}

async function resolve(params: Props['params']) {
  const p = await params;
  const grade = gradeByNo(p.class);
  const subject = grade && subjectBySlug(grade.id, p.subject);
  const topic = subject && topicIn(subject.id, p.topic);
  return grade && subject && topic ? { grade, subject, topic } : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  return { title: r ? `${r.topic.title} – ${r.subject.title} ${r.grade.no}` : 'Không tìm thấy chủ đề' };
}

/** Một chủ đề: các bài của chủ đề, chuyển nhanh sang chủ đề khác cùng môn */
export default async function TopicPage({ params }: Props) {
  const r = await resolve(params);
  if (!r) notFound();
  const { grade, subject, topic } = r;

  return (
    <main className="sheet">
      <CatalogHead
        crumbs={[
          { label: 'Chọn lớp', href: '/' },
          { label: grade.title, href: classHref(grade.id) },
          { label: subject.title, href: subjectHref(subject.id) },
          { label: topic.title },
        ]}
        title={topic.title}
        intro={`${subject.title} ${grade.no} · ${lessonsOf(topic.id).length} bài mô phỏng. Chọn một bài để mở.`}
      >
        <Tabs label="Chủ đề cùng môn" variant="topic"
          items={topicsOf(subject.id).map((t) => ({
            key: t.id, label: t.title, href: topicHref(t.id), current: t.id === topic.id,
          }))} />
      </CatalogHead>

      <LessonCards topic={topic.id} />

      <TeacherTip />
    </main>
  );
}
