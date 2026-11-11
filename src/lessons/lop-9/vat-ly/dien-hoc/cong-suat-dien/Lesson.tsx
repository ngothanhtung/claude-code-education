'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, isExact } from '@/lib/format';
import { B, N, U as Un, eq, u } from '@/lib/tex';
import { drawPower } from './sketch';

/** IR: biết số ghi trên đèn, tìm I và R; P: biết số chỉ ampe kế, tìm công suất */
type Mode = 'IR' | 'P';

export interface Params {
  mode: Mode;
  U: number;
  P: number; // số oát ghi trên đèn (dạng IR)
  I: number; // số chỉ ampe kế (dạng P)
}

const MODE_OPTIONS = [
  { value: 'IR', label: 'Biết số ghi trên đèn' },
  { value: 'P', label: 'Biết số chỉ ampe kế' },
] as const;

const U_OPTIONS: { value: number; label: string }[] = [
  { value: 6, label: '6 V' },
  { value: 12, label: '12 V' },
  { value: 110, label: '110 V' },
  { value: 220, label: '220 V' },
];

const LABELS: PlayLabels = { start: 'Bật đèn', pause: 'Tạm dừng', resume: 'Chạy tiếp', again: 'Bật lại' };

const PS = '\\mathscr{P}';

export default function CongSuatDienLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 4 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const show = sim.revealed;
  const findP = q.mode === 'P';
  const P = findP ? q.U * q.I : q.P;
  const I = findP ? q.I : q.P / q.U;
  const R = q.U / I;
  const e = (x: number) => eq(isExact(x));

  const draw = (p: p5) =>
    drawPower(p, { mode: 'congsuat', U: q.U, P, I, hours: 0, days: 1, t: sim.t, show, done: sim.done, findP });

  const problem = findP ? (
    <p>
      Một bóng đèn được mắc vào hiệu điện thế <Num tone="t">{fmt(q.U)} V</Num> thì ampe kế chỉ{' '}
      <Num tone="b">{fmt(q.I)} A</Num>. Tính công suất điện của đèn và điện trở của đèn khi đó.
    </p>
  ) : (
    <p>
      Trên một bóng đèn có ghi <Num tone="t">{fmt(q.U)} V – {fmt(q.P)} W</Num>. Đèn được mắc vào đúng hiệu điện thế{' '}
      <Num tone="t">{fmt(q.U)} V</Num>. Tính cường độ dòng điện chạy qua đèn và điện trở của đèn khi đó.
    </p>
  );

  const solution = findP ? (
    <>
      <Summary given={[`U = ${N(q.U)}${u('V')};\\ I = ${N(q.I)}${u('A')}`]} find={[PS, 'R']} />
      <Step>Công suất điện của đèn:</Step>
      <Calc tex={`${PS} = U \\times I = ${N(q.U)} \\times ${N(q.I)} ${e(P)} ${B(show, N(P))}${Un('W')}`} />
      <Step>Điện trở của đèn khi đó:</Step>
      <Calc tex={`R = U \\chia I = ${N(q.U)} \\chia ${N(q.I)} ${e(R)} ${B(show, N(R))}${Un('Ω')}`} />
      <Answer show={show} items={[`$${PS} ${e(P)} ${N(P)}${u('W')}$`, `$R ${e(R)} ${N(R)}${u('Ω')}$`]} />
    </>
  ) : (
    <>
      <Summary given={[`U = ${N(q.U)}${u('V')};\\ ${PS} = ${N(q.P)}${u('W')}`]} find={['I', 'R']} />
      <Step>Đèn dùng đúng hiệu điện thế định mức nên có công suất đúng bằng công suất định mức.</Step>
      <Step>{`Từ $${PS} = U \\times I$, cường độ dòng điện chạy qua đèn là:`}</Step>
      <Calc tex={`I = ${PS} \\chia U = ${N(q.P)} \\chia ${N(q.U)} ${e(I)} ${B(show, N(I))}${Un('A')}`} />
      <Step>Điện trở của đèn khi đó:</Step>
      <Calc tex={`R = U \\chia I = U \\times U \\chia ${PS} = ${N(q.U)} \\times ${N(q.U)} \\chia ${N(q.P)} ${e(R)} ${B(show, N(R))}${Un('Ω')}`} />
      <Answer show={show} items={[`$I ${e(I)} ${N(I)}${u('A')}$`, `$R ${e(R)} ${N(R)}${u('Ω')}$`]} />
    </>
  );

  return (
    <LessonLayout
      slug="cong-suat-dien"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Bóng đèn mắc vào nguồn qua khóa K và ampe kế; đèn sáng khi đóng khóa."
      readout={[
        { label: 'Hiệu điện thế', value: `${fmt(q.U)} V`, tone: 'time' },
        { label: 'Công suất', value: !findP || show ? `${fmt(P)} W` : '? W', tone: 'a' },
        { label: 'Cường độ dòng điện', value: findP || show ? `${fmt(I)} A` : '? A', tone: 'b' },
        { label: 'Điện trở của đèn', value: show ? `${fmt(R)} Ω` : '? Ω' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          <Segmented name="U" legend="Hiệu điện thế" options={U_OPTIONS} value={q.U} onChange={(v) => update({ U: v })} />
        </>
      }
      fields={
        <>
          <RangeField id="P" label="Số oát ghi trên đèn" tone="a" min={1} max={200} step={1}
            value={q.P} display={`${fmt(q.P)} W`} onChange={(v) => update({ P: v })} hidden={findP} />
          <RangeField id="I" label="Số chỉ ampe kế" tone="b" min={0.1} max={5} step={0.1}
            value={q.I} display={`${fmt(q.I)} A`} onChange={(v) => update({ I: v })} hidden={!findP} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Công suất điện', text: `$${PS} = U \\times I$, đơn vị oát (W)` },
        { term: 'Số oát ghi trên dụng cụ', text: 'công suất định mức, khi dùng đúng hiệu điện thế định mức' },
        { term: 'Đơn vị', text: '$1\\,\\text{kW} = 1000\\,\\text{W}$' },
      ]}
      playLabels={LABELS}
    />
  );
}
