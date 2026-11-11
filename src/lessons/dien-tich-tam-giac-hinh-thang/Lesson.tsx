'use client';

import { useState } from 'react';
import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/controls';
import { Answer, Calc, Step, Val } from '@/components/notebook';
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

const CUT_LABELS: PlayLabels = { start: 'Cắt ghép hình', pause: 'Tạm dừng', resume: 'Ghép tiếp', again: 'Xem lại' };

export default function DienTichLesson() {
  const [params, setParams] = useState<Params>({ mode: 'tamgiac', ...PRESETS.tamgiac });
  const { mode, a, b, h } = params;
  const trap = mode === 'hinhthang';
  const area = trap ? ((a + b) * h) / 2 : (a * h) / 2;

  const sim = useSimulation({ total: 3, defaultDuration: 7 });
  const update = (patch: Partial<Params>) => {
    setParams((prev) => {
      const next = { ...prev, ...patch };
      // đáy bé luôn nhỏ hơn đáy lớn
      if (next.b >= next.a) next.b = Math.max(1, next.a - 1);
      return next;
    });
    sim.reset();
  };

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
      <Calc>
        ({fmt(a)} + {fmt(b)}) × {fmt(h)} : 2 = <Val show={show}>{fmt(area, 4)}</Val> (cm²)
      </Calc>
      <Answer show={show} items={[`${fmt(area, 4)} cm²`]} />
    </>
  ) : (
    <>
      <Step>Diện tích hình tam giác là:</Step>
      <Calc>
        {fmt(a)} × {fmt(h)} : 2 = <Val show={show}>{fmt(area, 4)}</Val> (cm²)
      </Calc>
      <Answer show={show} items={[`${fmt(area, 4)} cm²`]} />
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
        <Segmented name="mode" legend="Hình" options={MODE_OPTIONS} value={mode}
          onChange={(m) => update({ mode: m, ...PRESETS[m] })} />
      }
      fields={
        <>
          <RangeField id="sA" label={trap ? 'Đáy lớn' : 'Độ dài đáy'} tone="a" min={2} max={16} step={0.5}
            value={a} display={`${fmt(a)} cm`} onChange={(v) => update({ a: v })} />
          <RangeField id="sB" label="Đáy bé" tone="a" min={1} max={15} step={0.5}
            value={b} display={`${fmt(b)} cm`} onChange={(v) => update({ b: Math.min(v, a - 0.5) })} hidden={!trap} />
          <RangeField id="sH" label="Chiều cao" tone="t" min={2} max={10} step={0.5}
            value={h} display={`${fmt(h)} cm`} onChange={(v) => update({ h: v })} />
        </>
      }
      solution={solution}
      rules={[
        { key: 'tamgiac', term: 'Diện tích hình tam giác', text: 'đáy × chiều cao : 2' },
        { key: 'hinhthang', term: 'Diện tích hình thang', text: '(đáy lớn + đáy bé) × chiều cao : 2' },
        { term: 'Đáy và chiều cao', text: 'phải cùng một đơn vị đo' },
      ]}
      activeRule={mode}
      playLabels={CUT_LABELS}
    />
  );
}
