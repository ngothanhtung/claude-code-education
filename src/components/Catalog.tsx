import Link from 'next/link';
import type { ReactNode } from 'react';
import { LESSON_THUMBS } from '@/components/LessonThumbs';
import { Rich } from '@/components/Tex';
import { lessonsOf, type TopicId } from '@/lib/lessons';

/**
 * Khối dùng chung cho các trang mục lục: /classes/<no>/subjects, …/<môn>, …/<môn>/topics/<chủ đề>.
 */

export interface Crumb {
  label: string;
  href?: string;
}

export interface Tab {
  key: string;
  label: ReactNode;
  href: string;
  current?: boolean;
}

/** Đầu trang: đường dẫn ngược, tiêu đề, lời dẫn, rồi các nút chuyển (lớp, chủ đề…) */
export function CatalogHead(props: { crumbs: Crumb[]; title: string; intro: string; children?: ReactNode }) {
  return (
    <header className="sheet-head">
      <nav className="breadcrumb" aria-label="Vị trí">
        {props.crumbs.map((c, i) => (
          <span key={c.label} className="crumb">
            {i > 0 && <span aria-hidden="true">›</span>}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </span>
        ))}
      </nav>
      <h1>{props.title}</h1>
      <p>{props.intro}</p>
      {props.children}
    </header>
  );
}

/** Hàng nút chuyển: kiểu "pill" viền (lớp) hoặc kiểu nền nhạt (chủ đề) */
export function Tabs({ label, items, variant }: { label: string; items: Tab[]; variant: 'grade' | 'topic' }) {
  return (
    <nav className={variant === 'grade' ? 'grade-switch' : 'topic-jump'} aria-label={label}>
      {items.map((t) => (
        <Link key={t.key} href={t.href} aria-current={t.current ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** Danh sách thẻ bài của một chủ đề */
export function LessonCards({ topic }: { topic: TopicId }) {
  return (
    <ol className="lesson-list">
      {lessonsOf(topic).map((l, i) => (
        <li key={l.slug}>
          <Link className="lesson-card" href={`/${l.slug}`}>
            {LESSON_THUMBS[l.slug]}
            <div>
              <div className="lesson-no">Bài {i + 1}</div>
              <h4 className="lesson-title">{l.title}</h4>
              <p>{l.summary}</p>
              <span className="lesson-rule">
                <b>{l.rule.term}</b>
                {l.rule.text.startsWith('$') ? ': ' : ' = '}
                <Rich text={l.rule.text} />
              </span>
              <div className="lesson-open">
                Mở mô phỏng
                <Arrow />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function TeacherTip() {
  return (
    <footer className="sheet-foot">
      Gợi ý cho giáo viên: mở bài trên màn chiếu, cho học sinh tự tính trước, rồi bấm nút phát để kiểm tra. Phím{' '}
      <b>Space</b> để chạy hoặc tạm dừng, <b>R</b> để làm lại.
    </footer>
  );
}
