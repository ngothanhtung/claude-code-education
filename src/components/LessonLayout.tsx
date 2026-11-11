'use client';

import type { ReactNode } from 'react';
import type { Simulation } from '@/hooks/useSimulation';
import { getLesson, getTopic, type LessonSlug } from '@/lib/lessons';
import LessonNav from './LessonNav';
import SimCanvas, { type Sketch } from './SimCanvas';
import { PlaybackControls, Readout, type PlayLabels, type ReadoutItem } from './controls';
import { Notebook, Rules, type RuleItem } from './notebook';

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
  /** xếp thanh trượt 2 cột (khi có 4 thanh) */
  twoColumnFields?: boolean;
  solution: ReactNode;
  rules: RuleItem[];
  activeRule?: string;
  /** nhãn nút phát (mặc định: "Cho xe chạy"…) */
  playLabels?: PlayLabels;
}

/** Khung chung của mọi bài: tiêu đề + đề bài + canvas + số liệu + điều chỉnh | vở bài giải + cần nhớ */
export default function LessonLayout(props: LessonLayoutProps) {
  const { slug, sim } = props;
  const lesson = getLesson(slug);
  const topic = getTopic(lesson.topic);

  return (
    <>
      <header className="masthead">
        <div>
          <h1>{lesson.title}</h1>
          <LessonNav current={slug} />
        </div>
        <p>Toán lớp 5, chủ đề {topic.title.toLowerCase()}. {topic.intro}</p>
      </header>

      <main className="workspace">
        <section className="stage" aria-labelledby="de-bai">
          <div className="problem">
            <h2 id="de-bai">Đề bài</h2>
            {props.problem}
            {props.notice && <p className="notice">{props.notice}</p>}
          </div>

          <SimCanvas draw={props.draw} label={props.canvasLabel} />

          <Readout items={props.readout} />

          <div className="controls">
            {props.mode}
            <div className={props.twoColumnFields ? 'fields cols-2' : 'fields'}>{props.fields}</div>
            <PlaybackControls sim={sim} labels={props.playLabels} />
          </div>
        </section>

        <aside className="side">
          <Notebook sim={sim}>{props.solution}</Notebook>
          <Rules items={props.rules} active={props.activeRule} />
        </aside>
      </main>

      <p className="footnote">
        Phím tắt khi trình chiếu: <kbd>Space</kbd> để chạy hoặc tạm dừng, <kbd>R</kbd> để làm lại. Mỗi lần đổi số liệu,
        hình minh họa và bài giải sẽ bắt đầu lại từ đầu.
      </p>
    </>
  );
}
