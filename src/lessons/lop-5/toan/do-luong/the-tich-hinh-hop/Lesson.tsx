'use client';

import { useState } from 'react';
import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step } from '@/components/Notebook';
import { B, N, UN } from '@/lib/tex';
import { useSimulation } from '@/hooks/useSimulation';
import { drawBox } from './sketch';

type Mode = 'hhcn' | 'lapphuong';

interface Params {
  mode: Mode;
  a: number;
  b: number;
  c: number;
}

const MODE_OPTIONS = [
  { value: 'hhcn', label: 'Hình hộp chữ nhật' },
  { value: 'lapphuong', label: 'Hình lập phương' },
] as const;

const LABELS: PlayLabels = { start: 'Xếp hình lập phương', pause: 'Tạm dừng', resume: 'Xếp tiếp', again: 'Xếp lại' };

export default function TheTichLesson() {
  const [params, setParams] = useState<Params>({ mode: 'hhcn', a: 5, b: 3, c: 4 });
  const cube = params.mode === 'lapphuong';
  // hình lập phương: ba kích thước bằng nhau
  const a = params.a;
  const b = cube ? params.a : params.b;
  const c = cube ? params.a : params.c;
  const V = a * b * c;

  const sim = useSimulation({ total: V, defaultDuration: 8 });
  const update = (patch: Partial<Params>) => {
    setParams((prev) => ({ ...prev, ...patch }));
    sim.reset();
  };

  const show = sim.revealed;
  const placed = Math.min(Math.floor(sim.t + 1e-9), V);
  const draw = (p: p5) => drawBox(p, { cube, a, b, c, t: sim.t, done: sim.done });

  const problem = cube ? (
    <p>
      Tính thể tích hình lập phương có cạnh <Num tone="t">{a} cm</Num>.
    </p>
  ) : (
    <p>
      Tính thể tích hình hộp chữ nhật có chiều dài <Num tone="t">{a} cm</Num>, chiều rộng <Num tone="t">{b} cm</Num>,
      chiều cao <Num tone="t">{c} cm</Num>.
    </p>
  );

  const solution = (
    <>
      <Step>Thể tích hình {cube ? 'lập phương' : 'hộp chữ nhật'} là:</Step>
      <Calc tex={`${a} \\times ${b} \\times ${c} = ${B(show, N(V))}\\;(${UN('cm³')})`} />
      <Answer show={show} items={[`$${N(V)}\\,${UN('cm³')}$`]} />
    </>
  );

  return (
    <LessonLayout
      slug="the-tich-hinh-hop"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel={`Xếp các hình lập phương 1 cm³ vào hộp kích thước ${a} × ${b} × ${c} cm, từng hàng, từng lớp.`}
      readout={[
        { label: cube ? 'Cạnh' : 'Chiều dài', value: `${a} cm`, tone: 'time' },
        { label: cube ? 'Mỗi lớp' : 'Chiều rộng', value: cube ? `${a * b} hình` : `${b} cm`, tone: 'time' },
        { label: cube ? 'Số lớp' : 'Chiều cao', value: `${c}${cube ? ' lớp' : ' cm'}`, tone: 'time' },
        { label: 'Hình 1 cm³ đã xếp', value: `${placed} hình`, sub: show ? `thể tích ${V} cm³` : 'thể tích ? cm³', tone: 'b' },
      ]}
      mode={
        <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={params.mode} onChange={(m) => update(m === 'lapphuong' ? { mode: m, a: 4 } : { mode: m, a: 5, b: 3, c: 4 })} />
      }
      fields={
        <>
          <RangeField id="sA" label={cube ? 'Cạnh' : 'Chiều dài'} tone="t" min={1} max={cube ? 6 : 8} step={1}
            value={a} display={`${a} cm`} onChange={(v) => update({ a: v })} />
          <RangeField id="sB" label="Chiều rộng" tone="t" min={1} max={5} step={1}
            value={params.b} display={`${params.b} cm`} onChange={(v) => update({ b: v })} hidden={cube} />
          <RangeField id="sC" label="Chiều cao" tone="t" min={1} max={5} step={1}
            value={params.c} display={`${params.c} cm`} onChange={(v) => update({ c: v })} hidden={cube} />
        </>
      }
      solution={solution}
      rules={[
        { key: 'hhcn', term: 'Thể tích hình hộp chữ nhật', text: 'chiều dài × chiều rộng × chiều cao, $V = a \\times b \\times c$' },
        { key: 'lapphuong', term: 'Thể tích hình lập phương', text: 'cạnh × cạnh × cạnh, $V = a \\times a \\times a$' },
        { term: 'Xăng-ti-mét khối', text: 'thể tích hình lập phương có cạnh 1 cm' },
      ]}
      activeRule={params.mode}
      playLabels={LABELS}
    />
  );
}
