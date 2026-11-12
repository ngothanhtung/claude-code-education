'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step } from '@/components/Notebook';
import { B, N, UN } from '@/lib/tex';
import { useParams } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt } from '@/lib/format';
import { drawShapes } from './sketch';

type Mode = 'tamgiac' | 'hinhthang';

interface Params {
  mode: Mode;
  a: number; // đáy / đáy lớn
  b: number; // đáy bé
  h: number;
}

const MODE_OPTIONS = [
  { value: 'tamgiac', label: 'Hình tam giác' },
  { value: 'hinhthang', label: 'Hình thang' },
] as const;

const PRESETS: Record<Mode, Omit<Params, 'mode'>> = {
  tamgiac: { a: 8, b: 4, h: 5 },
  hinhthang: { a: 10, b: 6, h: 5 },
};

/** Đáy bé luôn nhỏ hơn đáy lớn */
const fix = (q: Params): Params => (q.b >= q.a ? { ...q, b: Math.max(1, q.a - 1) } : q);

const CUT_LABELS = playLabels('Cắt ghép hình', 'Ghép tiếp', 'Xem lại');

export default function DienTichLesson() {
  const { params, edit } = useParams<Params>({ mode: 'tamgiac', ...PRESETS.tamgiac }, fix);
  const { mode, a, b, h } = params;
  const trap = mode === 'hinhthang';
  const area = trap ? ((a + b) * h) / 2 : (a * h) / 2;

  const sim = useSimulation({ total: 3, defaultDuration: 7, resetOn: params });

  const show = sim.revealed;
  const draw = (p: p5) => drawShapes(p, { mode, a, b, h, area, t: sim.t, done: sim.done });

  const A = <Num tone="a">{fmt(a)} cm</Num>;
  const H = <Num tone="t">{fmt(h)} cm</Num>;
  const problem = trap ? (
    <p>
      Tính diện tích hình thang có độ dài hai đáy lần lượt là {A} và <Num tone="a">{fmt(b)} cm</Num>, chiều cao là {H}.
    </p>
  ) : (
    <p>
      Tính diện tích hình tam giác có độ dài đáy là {A} và chiều cao là {H}.
    </p>
  );

  const solution = trap ? (
    <>
      <Step>Diện tích hình thang là:</Step>
      <Calc tex={`(${N(a)} + ${N(b)}) \\times ${N(h)} \\chia 2 = ${B(show, N(area, 4))}\\;(${UN('cm²')})`} />
      <Answer show={show} items={[`$${N(area, 4)}\\,${UN('cm²')}$`]} />
    </>
  ) : (
    <>
      <Step>Diện tích hình tam giác là:</Step>
      <Calc tex={`${N(a)} \\times ${N(h)} \\chia 2 = ${B(show, N(area, 4))}\\;(${UN('cm²')})`} />
      <Answer show={show} items={[`$${N(area, 4)}\\,${UN('cm²')}$`]} />
    </>
  );

  return (
    <LessonLayout
      slug="dien-tich-tam-giac-hinh-thang"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel={
        trap
          ? 'Hình thang được cắt theo đường nối đỉnh với trung điểm cạnh bên, xoay mảnh cắt để ghép thành một hình tam giác.'
          : 'Hình tam giác được cắt theo đường cao, hai mảnh xoay ra ghép thành hình chữ nhật cùng đáy, cùng chiều cao.'
      }
      readout={[
        { label: trap ? 'Đáy lớn' : 'Đáy', value: `${fmt(a)} cm`, tone: 'a' },
        { label: 'Đáy bé', value: trap ? `${fmt(b)} cm` : '–', tone: 'a' },
        { label: 'Chiều cao', value: `${fmt(h)} cm`, tone: 'time' },
        { label: 'Diện tích', value: show ? `${fmt(area, 4)} cm²` : '? cm²' },
      ]}
      mode={
        <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={mode}
          onChange={(m) => edit({ mode: m, ...PRESETS[m] })} />
      }
      fields={
        <>
          <RangeField id="sA" label={trap ? 'Đáy lớn' : 'Độ dài đáy'} tone="a" min={2} max={16} step={0.5}
            value={a} display={`${fmt(a)} cm`} onChange={(v) => edit({ a: v })} />
          <RangeField id="sB" label="Đáy bé" tone="a" min={1} max={15} step={0.5}
            value={b} display={`${fmt(b)} cm`} onChange={(v) => edit({ b: Math.min(v, a - 0.5) })} hidden={!trap} />
          <RangeField id="sH" label="Chiều cao" tone="t" min={2} max={10} step={0.5}
            value={h} display={`${fmt(h)} cm`} onChange={(v) => edit({ h: v })} />
        </>
      }
      solution={solution}
      rules={[
        { key: 'tamgiac', term: 'Diện tích hình tam giác', text: 'đáy × chiều cao : 2, $S = a \\times h \\chia 2$' },
        { key: 'hinhthang', term: 'Diện tích hình thang', text: '(đáy lớn + đáy bé) × chiều cao : 2, $S = (a + b) \\times h \\chia 2$' },
        { term: 'Đáy và chiều cao', text: 'phải cùng một đơn vị đo' },
      ]}
      activeRule={mode}
      playLabels={CUT_LABELS}
    />
  );
}
