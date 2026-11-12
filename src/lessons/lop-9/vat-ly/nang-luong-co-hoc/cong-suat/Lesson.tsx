'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { B, N, U, eq as teq, u } from '@/lib/tex';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { COL } from '@/lib/draw/colors';
import { fmt, fmtG, isExact } from '@/lib/format';
import { drawCranes } from './sketch';

export interface Params {
  m1: number; h1: number; t1: number;
  m2: number; h2: number; t2: number;
}

const LABELS = playLabels('Nâng hàng', 'Nâng tiếp', 'Nâng lại');

export default function CongSuatLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const total = Math.max(q.t1, q.t2);
  const sim = useSimulation({ total, defaultDuration: 8, resetOn: ex.params });

  const A1 = 10 * q.m1 * q.h1;
  const A2 = 10 * q.m2 * q.h2;
  const P1 = A1 / q.t1;
  const P2 = A2 / q.t2;
  const show = sim.revealed;
  const verdict =
    Math.abs(P1 - P2) < 1e-9
      ? 'Hai cần cẩu có công suất bằng nhau'
      : P1 > P2
        ? 'Cần cẩu A có công suất lớn hơn, làm việc khỏe hơn'
        : 'Cần cẩu B có công suất lớn hơn, làm việc khỏe hơn';

  const draw = (p: p5) =>
    drawCranes(p, {
      A: { name: 'Cần cẩu A', m: q.m1, h: q.h1, t: q.t1, col: COL.a, textCol: COL.aText },
      B: { name: 'Cần cẩu B', m: q.m2, h: q.h2, t: q.t2, col: COL.b, textCol: COL.bText },
      now: sim.t,
      hMax: Math.max(q.h1, q.h2),
      workMax: Math.max(A1, A2),
      done: sim.done,
    });

  const work = (m: number, h: number, t: number) => 10 * m * h * Math.min(sim.t / t, 1);

  const problem = (
    <>
      <p>
        Cần cẩu A nâng kiện hàng <Num tone="a">{fmtG(q.m1, 0)} kg</Num> lên cao <Num tone="a">{fmt(q.h1)} m</Num> trong{' '}
        <Num tone="a">{fmt(q.t1)} giây</Num>. Cần cẩu B nâng kiện hàng <Num tone="b">{fmtG(q.m2, 0)} kg</Num> lên cao{' '}
        <Num tone="b">{fmt(q.h2)} m</Num> trong <Num tone="b">{fmt(q.t2)} giây</Num>. Hỏi:
      </p>
      <ol>
        <li>Mỗi cần cẩu thực hiện công bao nhiêu?</li>
        <li>Cần cẩu nào có công suất lớn hơn?</li>
      </ol>
    </>
  );

  const solution = (
    <>
      <Summary
        given={[
          `m_1 = ${N(q.m1)}${u('kg')};\\ h_1 = ${N(q.h1)}${u('m')};\\ t_1 = ${N(q.t1)}${u('s')}`,
          `m_2 = ${N(q.m2)}${u('kg')};\\ h_2 = ${N(q.h2)}${u('m')};\\ t_2 = ${N(q.t2)}${u('s')}`,
        ]}
        find={['A_1', 'A_2', '\\mathscr{P}_1', '\\mathscr{P}_2']}
      />
      <Step>{'Công của cần cẩu A (nâng vật lên cao $h$ thì $A = P \\times h$):'}</Step>
      <Calc tex={`A_1 = 10 \\times ${N(q.m1)} \\times ${N(q.h1)} = ${B(show, N(A1))}${U('J')}`} />
      <Step>Công của cần cẩu B:</Step>
      <Calc tex={`A_2 = 10 \\times ${N(q.m2)} \\times ${N(q.h2)} = ${B(show, N(A2))}${U('J')}`} />
      <Step>Công suất của hai cần cẩu:</Step>
      <Calc
        tex={`\\mathscr{P}_1 = A_1 \\chia t_1 = ${B(show, N(A1))} \\chia ${N(q.t1)} ${teq(isExact(P1))} ${B(show, N(P1))}${U('W')}`}
      />
      <Calc
        tex={`\\mathscr{P}_2 = A_2 \\chia t_2 = ${B(show, N(A2))} \\chia ${N(q.t2)} ${teq(isExact(P2))} ${B(show, N(P2))}${U('W')}`}
      />
      <Step>{show ? `${verdict}.` : <span className="blank">?</span>}</Step>
      <Answer
        show={show}
        items={[
          `$A_1 = ${N(A1)}${u('J')},\\ A_2 = ${N(A2)}${u('J')}$`,
          `$\\mathscr{P}_1 ${teq(isExact(P1))} ${N(P1)}${u('W')},\\ \\mathscr{P}_2 ${teq(isExact(P2))} ${N(P2)}${u('W')}$`,
        ]}
      />
    </>
  );

  return (
    <LessonLayout
      slug="cong-suat"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Hai cần cẩu nâng hai kiện hàng cùng lúc; thanh dưới mỗi cần cẩu cho biết công đã thực hiện."
      readout={[
        { label: 'Thời gian', value: `${fmt(sim.t, 1)} s`, tone: 'time' },
        { label: 'Công cần cẩu A', value: `${fmtG(work(q.m1, q.h1, q.t1), 0)} J`, tone: 'a' },
        { label: 'Công cần cẩu B', value: `${fmtG(work(q.m2, q.h2, q.t2), 0)} J`, tone: 'b' },
        {
          label: 'Công suất A và B',
          value: show ? `${fmtG(P1, 0)} và ${fmtG(P2, 0)}` : '? và ?',
          sub: 'đơn vị oát (W)',
        },
      ]}
      fields={
        <>
          <RangeField id="m1" label="Khối lượng hàng A" tone="a" min={100} max={2000} step={100}
            value={q.m1} display={`${fmtG(q.m1, 0)} kg`} onChange={(v) => ex.edit({ m1: v })} />
          <RangeField id="m2" label="Khối lượng hàng B" tone="b" min={100} max={2000} step={100}
            value={q.m2} display={`${fmtG(q.m2, 0)} kg`} onChange={(v) => ex.edit({ m2: v })} />
          <RangeField id="h1" label="Độ cao nâng A" tone="a" min={1} max={20} step={1}
            value={q.h1} display={`${q.h1} m`} onChange={(v) => ex.edit({ h1: v })} />
          <RangeField id="h2" label="Độ cao nâng B" tone="b" min={1} max={20} step={1}
            value={q.h2} display={`${q.h2} m`} onChange={(v) => ex.edit({ h2: v })} />
          <RangeField id="t1" label="Thời gian nâng A" tone="a" min={5} max={60} step={5}
            value={q.t1} display={`${q.t1} s`} onChange={(v) => ex.edit({ t1: v })} />
          <RangeField id="t2" label="Thời gian nâng B" tone="b" min={5} max={60} step={5}
            value={q.t2} display={`${q.t2} s`} onChange={(v) => ex.edit({ t2: v })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Công suất', text: '$\\mathscr{P} = A \\chia t$: công thực hiện trong một đơn vị thời gian' },
        { term: 'So sánh', text: 'máy có công suất lớn hơn thì làm việc nhanh hơn (khỏe hơn)' },
        { term: 'Đơn vị', text: '$1\\,\\text{W} = 1\\,\\text{J/s}$; $1\\,\\text{kW} = 1000\\,\\text{W}$' },
      ]}
      playLabels={LABELS}
    />
  );
}
