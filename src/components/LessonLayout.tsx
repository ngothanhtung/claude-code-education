'use client';

import type { ReactNode } from 'react';
import type { Simulation } from '@/hooks/useSimulation';
import Link from 'next/link';
import { classHref, subjectHref, topicHref, trailOf, type LessonSlug } from '@/lib/lessons';
import Calculator from './Calculator';
import PeriodicTable from './PeriodicTable';
import LessonNav from './LessonNav';
import SimCanvas, { type Sketch } from './SimCanvas';
import { PlaybackControls, Readout, Segmented, type PlayLabels, type ReadoutItem } from './Controls';
import type { Exercises } from '@/hooks/useExercises';
import { Notebook, Rules, type RuleItem } from './Notebook';

interface LessonLayoutProps {
  slug: LessonSlug;
  sim: Simulation;
  /** nội dung đề bài (đoạn văn + câu hỏi) */
  problem: ReactNode;
  /** cảnh báo khi số liệu không hợp lệ */
  notice?: string | null;
  draw: Sketch;
  canvasLabel: string;
  readout: ReadoutItem[];
  /** nhóm chọn dạng đề / đại lượng cần tìm (nếu có) */
  mode?: ReactNode;
  /** các thanh trượt */
  fields: ReactNode;
  solution: ReactNode;
  rules: RuleItem[];
  activeRule?: string;
  /** nhãn nút phát (mặc định: "Cho xe chạy"…) */
  playLabels?: PlayLabels;
  /** bộ bài tập soạn sẵn (Bài tập 1…5) */
  exercises?: Pick<Exercises<unknown>, 'current' | 'count' | 'pick'>;
}

/** Khung chung của mọi bài: tiêu đề + đề bài + canvas + số liệu + điều chỉnh | vở bài giải + cần nhớ */
export default function LessonLayout(props: LessonLayoutProps) {
  const { slug, sim, exercises: ex } = props;
  const { lesson, topic, subject, grade } = trailOf(slug);
  const exOptions = ex ? Array.from({ length: ex.count }, (_, i) => ({ value: i, label: `Bài ${i + 1}` })) : [];

  return (
    <>
      <header className="masthead">
        <div>
          <nav className="breadcrumb" aria-label="Vị trí bài học">
            <Link href={classHref(grade.id)}>{grade.title}</Link>
            <span aria-hidden="true">›</span>
            <Link href={subjectHref(subject.id)}>{subject.title}</Link>
            <span aria-hidden="true">›</span>
            <Link href={topicHref(topic.id)}>{topic.title}</Link>
          </nav>
          <h1>{lesson.title}</h1>
          <LessonNav current={slug} />
        </div>
        <p>{topic.intro}</p>
      </header>

      <main className="workspace">
        <section className="stage" aria-labelledby="de-bai">
          <div className="problem">
            <h2 id="de-bai">
              Đề bài
              {ex && (
                <span className={`ex-tag${ex.current === null ? ' ex-own' : ''}`}>
                  {ex.current === null ? 'Số liệu tự đặt' : `Bài tập ${ex.current + 1}`}
                </span>
              )}
            </h2>
            {props.problem}
            {props.notice && <p className="notice">{props.notice}</p>}
          </div>

          <SimCanvas draw={props.draw} label={props.canvasLabel} />

          <Readout items={props.readout} />
        </section>

        {/* Bảng điều chỉnh: nút thao tác + tham số, đặt cạnh mô phỏng */}
        <section className="control-panel" aria-labelledby="dieu-chinh">
          <h2 id="dieu-chinh">Điều chỉnh</h2>
          {ex && (
            <Segmented
              className="mode exercises"
              name="exercise"
              legend="Bài tập"
              options={exOptions}
              value={ex.current ?? -1}
              onChange={(i) => {
                ex.pick(i);
                sim.reset();
              }}
            />
          )}
          <PlaybackControls sim={sim} labels={props.playLabels} />
          <div className="controls">
            {props.mode}
            <div className="fields">{props.fields}</div>
          </div>
        </section>

        {/* Bài giải nằm dưới mô phỏng, rộng hết cột */}
        <Notebook sim={sim}>{props.solution}</Notebook>

        <Rules items={props.rules} active={props.activeRule} />
      </main>

      <p className="footnote">
        Phím tắt khi trình chiếu: <kbd>Space</kbd> để chạy hoặc tạm dừng, <kbd>R</kbd> để làm lại. Mỗi lần đổi số liệu,
        hình minh họa và bài giải sẽ bắt đầu lại từ đầu.
      </p>

      {/* Công cụ nổi ở góc phải dưới: bảng tuần hoàn (Hóa học), máy tính (Vật lý, Hóa học) */}
      {(subject.calculator || subject.periodicTable) && (
        <div className="tool-dock">
          {subject.periodicTable && <PeriodicTable />}
          {subject.calculator && <Calculator />}
        </div>
      )}
    </>
  );
}
