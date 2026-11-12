'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, fmtG, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { drawWork } from './sketch';

/** keo: tính công của lực kéo; nang: tính công nâng vật; luc: biết công, tính lực kéo */
type Mode = 'keo' | 'nang' | 'luc';

const MODE_OPTIONS = [
  { value: 'keo', label: 'Tính công (kéo vật)' },
  { value: 'nang', label: 'Tính công (nâng vật)' },
  { value: 'luc', label: 'Tính lực kéo' },
] as const;

export interface Params {
  mode: Mode;
  /** người/máy thực hiện công và vật bị tác dụng lực */
  actor: string;
  thing: string;
  wheels: boolean;
  F: number; // N
  s: number; // m
  m: number; // kg
  h: number; // m
  A: number; // J (đề cho khi tính lực)
}

const LABELS = playLabels('Tác dụng lực', 'Chạy tiếp', 'Thực hiện lại');

/** Đáp số công: thêm kJ khi số lớn */
const kJ = (A: number) => (A >= 10000 ? ` = ${N(A / 1000)}${u('kJ')}` : '');

export default function CongCoHocLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 4, resetOn: ex.params });

  const show = sim.revealed;
  const lift = q.mode === 'nang';
  const P = 10 * q.m;
  const F = lift ? P : q.mode === 'luc' ? q.A / q.s : q.F;
  const d = lift ? q.h : q.s;
  const A = q.mode === 'luc' ? q.A : F * d;
  const e = (x: number) => eq(isExact(x));
  const k = Math.min(1, sim.t);
  const Actor = q.actor.charAt(0).toUpperCase() + q.actor.slice(1);

  const draw = (p: p5) =>
    drawWork(p, {
      lift,
      wheels: q.wheels,
      FText: q.mode === 'luc' && !show ? '?' : `${fmtG(F)} N`,
      dText: `${fmt(d)} m`,
      AText: `${fmtG(A * k, 0)} J`,
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  let problem;
  let solution;
  if (q.mode === 'keo') {
    problem = (
      <p>
        {Actor} kéo {q.thing} bằng một lực không đổi <Num tone="a">{fmtG(q.F)} N</Num> theo phương nằm ngang,{' '}
        {q.thing} dịch chuyển được <Num tone="t">{fmtG(q.s)} m</Num> theo phương của lực. Tính công của lực kéo.
      </p>
    );
    solution = (
      <>
        <Summary given={[`F = ${N(q.F)}${u('N')};\\ s = ${N(q.s)}${u('m')}`]} find={['A']} />
        <Step>Công của lực kéo:</Step>
        <Calc tex={`A = F \\times s = ${N(q.F)} \\times ${N(q.s)} = ${B(show, N(A))}${U('J')}`} />
        <Answer show={show} items={[`$A = ${N(A)}${u('J')}${kJ(A)}$`]} />
      </>
    );
  } else if (lift) {
    problem = (
      <p>
        {Actor} nâng đều {q.thing} có khối lượng <Num tone="a">{fmtG(q.m)} kg</Num> lên độ cao{' '}
        <Num tone="t">{fmt(q.h)} m</Num>. Tính công mà {q.actor.replace(/^một /, '')} đã thực hiện.
      </p>
    );
    solution = (
      <>
        <Summary given={[`m = ${N(q.m)}${u('kg')};\\ h = ${N(q.h)}${u('m')}`]} find={['A']} />
        <Step>Nâng đều vật thì lực nâng bằng trọng lượng của vật:</Step>
        <Calc tex={`F = P = 10 \\times m = 10 \\times ${N(q.m)} = ${B(show, N(P))}${U('N')}`} />
        <Step>Công nâng vật lên độ cao h:</Step>
        <Calc tex={`A = P \\times h = ${B(show, N(P))} \\times ${N(q.h)} ${e(A)} ${B(show, N(A))}${U('J')}`} />
        <Answer show={show} items={[`$A ${e(A)} ${N(A)}${u('J')}${kJ(A)}$`]} />
      </>
    );
  } else {
    problem = (
      <p>
        {Actor} kéo {q.thing} đi được <Num tone="t">{fmtG(q.s)} m</Num> theo phương của lực kéo thì thực hiện được
        một công <Num tone="b">{fmtG(q.A)} J</Num>. Tính độ lớn của lực kéo.
      </p>
    );
    solution = (
      <>
        <Summary given={[`s = ${N(q.s)}${u('m')};\\ A = ${N(q.A)}${u('J')}`]} find={['F']} />
        <Step>{'Từ $A = F \\times s$ suy ra lực kéo:'}</Step>
        <Calc tex={`F = A \\chia s = ${N(q.A)} \\chia ${N(q.s)} ${e(F)} ${B(show, N(F))}${U('N')}`} />
        <Answer show={show} items={[`$F ${e(F)} ${N(F)}${u('N')}$`]} />
      </>
    );
  }

  return (
    <LessonLayout
      slug="cong-co-hoc"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel={
        lift
          ? 'Ròng rọc nâng thùng hàng lên độ cao h; thanh dưới cho biết công đã thực hiện.'
          : 'Lực F kéo vật dịch chuyển quãng đường s theo phương của lực; thanh dưới cho biết công đã thực hiện.'
      }
      readout={[
        { label: lift ? 'Lực nâng' : 'Lực kéo', value: q.mode === 'luc' && !show ? '? N' : `${fmtG(F)} N`, tone: 'a' },
        { label: lift ? 'Độ cao' : 'Quãng đường', value: `${fmt(d * k)} m`, sub: `trên ${fmt(d)} m`, tone: 'time' },
        { label: 'Công đã thực hiện', value: `${fmtG(A * k, 0)} J`, tone: 'b' },
      ]}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />}
      fields={
        <>
          <RangeField id="F" label="Lực kéo" tone="a" min={50} max={2000} step={50}
            value={q.F} display={`${fmtG(q.F)} N`} onChange={(x) => ex.edit({ F: x })} hidden={q.mode !== 'keo'} />
          <RangeField id="s" label="Quãng đường" tone="t" min={5} max={500} step={5}
            value={q.s} display={`${fmtG(q.s)} m`} onChange={(x) => ex.edit({ s: x })} hidden={lift} />
          <RangeField id="m" label="Khối lượng vật" tone="a" min={5} max={500} step={5}
            value={q.m} display={`${fmtG(q.m)} kg`} onChange={(x) => ex.edit({ m: x })} hidden={!lift} />
          <RangeField id="h" label="Độ cao nâng" tone="t" min={0.5} max={20} step={0.5}
            value={q.h} display={`${fmt(q.h)} m`} onChange={(x) => ex.edit({ h: x })} hidden={!lift} />
          <RangeField id="A" label="Công thực hiện" tone="b" min={500} max={100000} step={500}
            value={q.A} display={`${fmtG(q.A)} J`} onChange={(x) => ex.edit({ A: x })} hidden={q.mode !== 'luc'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Công cơ học', text: 'có khi lực tác dụng vào vật làm vật dịch chuyển theo phương của lực' },
        { term: 'Công thức', text: '$A = F \\times s$ ($F$: N, $s$: m, $A$: J)' },
        { term: 'Nâng vật lên cao', text: '$A = P \\times h = 10 \\times m \\times h$' },
        { term: 'Đơn vị', text: '$1\\,\\text{J} = 1\\,\\text{N} \\times 1\\,\\text{m}$; $1\\,\\text{kJ} = 1000\\,\\text{J}$' },
      ]}
      playLabels={LABELS}
    />
  );
}
