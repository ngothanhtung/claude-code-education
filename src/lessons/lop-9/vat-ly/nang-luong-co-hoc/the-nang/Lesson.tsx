'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, fmtG, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { drawPotential } from './sketch';

const WT = 'W_\\text{t}';

/** W: tính thế năng; h: tính độ cao; m: tính khối lượng; moc: so sánh hai mốc thế năng */
type Mode = 'W' | 'h' | 'm' | 'moc';

const MODE_OPTIONS = [
  { value: 'W', label: 'Tính thế năng' },
  { value: 'h', label: 'Tính độ cao' },
  { value: 'm', label: 'Tính khối lượng' },
  { value: 'moc', label: 'Đổi mốc thế năng' },
] as const;

export interface Params {
  mode: Mode;
  name: string;
  shape: 'box' | 'ball';
  m: number; // kg
  h: number; // m, so với mặt đất/sàn
  W: number; // J (đề cho khi tìm h hoặc m)
  hb: number; // m, độ cao mặt bàn (dạng đổi mốc)
}

/** Dạng đổi mốc: vật phải cao hơn mặt bàn */
function fix(q: Params): Params {
  return q.mode === 'moc' && q.h <= q.hb ? { ...q, h: Math.ceil((q.hb + 0.1) * 2) / 2 } : q;
}

const LABELS: PlayLabels = { start: 'Nâng vật', pause: 'Tạm dừng', resume: 'Nâng tiếp', again: 'Nâng lại' };

export default function TheNangLesson() {
  const ex = useExercises(EXERCISES, fix);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 4 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const show = sim.revealed;
  const moc = q.mode === 'moc';
  const ground = moc ? 'sàn nhà' : 'mặt đất';
  // đáp án theo dạng đề
  const P = q.mode === 'm' ? q.W / q.h : 10 * q.m;
  const m = P / 10;
  const h = q.mode === 'h' ? q.W / P : q.h;
  const W = q.mode === 'W' || moc ? P * q.h : q.W;
  const h2 = q.h - q.hb;
  const W2 = P * h2;
  const e = (x: number) => eq(isExact(x));
  const hide = (unknown: boolean, text: string) => (unknown && !show ? '?' : text);

  const draw = (p: p5) =>
    drawPotential(p, {
      shape: q.shape,
      m,
      h,
      hb: moc ? q.hb : 0,
      mText: hide(q.mode === 'm', `${fmtG(m)} kg`),
      hText: hide(q.mode === 'h', `${fmt(h)} m`),
      WText: hide(q.mode === 'W' || moc, `${fmtG(W)} J`),
      W2Text: hide(moc, `${fmtG(W2)} J`),
      groundName: ground,
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const Name = q.name.charAt(0).toUpperCase() + q.name.slice(1);
  const pLine = <Calc tex={`P = 10 \\times m = 10 \\times ${N(q.m)} = ${B(show, N(P))}${U('N')}`} />;

  let problem;
  let solution;
  if (q.mode === 'W') {
    problem = (
      <p>
        Một {q.name} có khối lượng <Num tone="a">{fmtG(q.m)} kg</Num> ở độ cao <Num tone="t">{fmt(q.h)} m</Num> so
        với mặt đất. Chọn mốc thế năng tại mặt đất, tính thế năng trọng trường của {q.name}.
      </p>
    );
    solution = (
      <>
        <Summary given={[`m = ${N(q.m)}${u('kg')};\\ h = ${N(q.h)}${u('m')}`]} find={[WT]} />
        <Step>Trọng lượng của {q.name}:</Step>
        {pLine}
        <Step>Thế năng trọng trường của {q.name}:</Step>
        <Calc tex={`${WT} = P \\times h = ${B(show, N(P))} \\times ${N(q.h)} ${e(W)} ${B(show, N(W))}${U('J')}`} />
        <Answer show={show} items={[`$${WT} ${e(W)} ${N(W)}${u('J')}$`]} />
      </>
    );
  } else if (q.mode === 'h') {
    problem = (
      <p>
        Một {q.name} có khối lượng <Num tone="a">{fmtG(q.m)} kg</Num> có thế năng trọng trường{' '}
        <Num tone="b">{fmtG(q.W)} J</Num> (mốc thế năng tại mặt đất). Hỏi {q.name} đang ở độ cao bao nhiêu so với mặt
        đất?
      </p>
    );
    solution = (
      <>
        <Summary given={[`m = ${N(q.m)}${u('kg')};\\ ${WT} = ${N(q.W)}${u('J')}`]} find={['h']} />
        <Step>Trọng lượng của {q.name}:</Step>
        {pLine}
        <Step>{`Từ $${WT} = P \\times h$ suy ra độ cao:`}</Step>
        <Calc tex={`h = ${WT} \\chia P = ${N(q.W)} \\chia ${B(show, N(P))} ${e(h)} ${B(show, N(h))}${U('m')}`} />
        <Answer show={show} items={[`$h ${e(h)} ${N(h)}${u('m')}$`]} />
      </>
    );
  } else if (q.mode === 'm') {
    problem = (
      <p>
        {Name} ở độ cao <Num tone="t">{fmt(q.h)} m</Num> so với mặt đất có thế năng trọng trường{' '}
        <Num tone="b">{fmtG(q.W)} J</Num> (mốc thế năng tại mặt đất). Tính khối lượng của {q.name}.
      </p>
    );
    solution = (
      <>
        <Summary given={[`h = ${N(q.h)}${u('m')};\\ ${WT} = ${N(q.W)}${u('J')}`]} find={['m']} />
        <Step>{`Từ $${WT} = P \\times h$ suy ra trọng lượng của ${q.name}:`}</Step>
        <Calc tex={`P = ${WT} \\chia h = ${N(q.W)} \\chia ${N(q.h)} ${e(P)} ${B(show, N(P))}${U('N')}`} />
        <Step>Khối lượng của {q.name}:</Step>
        <Calc tex={`m = P \\chia 10 = ${B(show, N(P))} \\chia 10 ${e(m)} ${B(show, N(m))}${U('kg')}`} />
        <Answer show={show} items={[`$m ${e(m)} ${N(m)}${u('kg')}$`]} />
      </>
    );
  } else {
    problem = (
      <>
        <p>
          Một {q.name} có khối lượng <Num tone="a">{fmtG(q.m)} kg</Num> đặt trên giá cao{' '}
          <Num tone="t">{fmt(q.h)} m</Num> so với sàn nhà. Mặt bàn cao <Num tone="b">{fmt(q.hb)} m</Num> so với sàn. Tính
          thế năng trọng trường của {q.name} khi:
        </p>
        <ol>
          <li>Chọn mốc thế năng tại sàn nhà.</li>
          <li>Chọn mốc thế năng tại mặt bàn.</li>
        </ol>
      </>
    );
    solution = (
      <>
        <Summary given={[`m = ${N(q.m)}${u('kg')};\\ h = ${N(q.h)}${u('m')};\\ h_\\text{bàn} = ${N(q.hb)}${u('m')}`]} find={[`${WT}`, `${WT}'`]} />
        <Step>Trọng lượng của {q.name}:</Step>
        {pLine}
        <Step>a) Mốc thế năng tại sàn nhà:</Step>
        <Calc tex={`${WT} = P \\times h = ${B(show, N(P))} \\times ${N(q.h)} ${e(W)} ${B(show, N(W))}${U('J')}`} />
        <Step>b) Độ cao của {q.name} so với mặt bàn:</Step>
        <Calc tex={`h' = h - h_\\text{bàn} = ${N(q.h)} - ${N(q.hb)} = ${B(show, N(h2))}${U('m')}`} />
        <Calc tex={`${WT}' = P \\times h' = ${B(show, N(P))} \\times ${B(show, N(h2))} ${e(W2)} ${B(show, N(W2))}${U('J')}`} />
        <Answer show={show} items={[`$${WT} ${e(W)} ${N(W)}${u('J')}$`, `$${WT}' ${e(W2)} ${N(W2)}${u('J')}$`]} />
      </>
    );
  }

  return (
    <LessonLayout
      slug="the-nang"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Vật được ròng rọc nâng từ mặt đất lên độ cao h; cột bên phải cho biết thế năng trọng trường tăng theo độ cao."
      readout={[
        { label: 'Khối lượng', value: hide(q.mode === 'm', `${fmtG(m)} kg`), tone: 'a' },
        { label: 'Độ cao', value: hide(q.mode === 'h', `${fmt(h)} m`), tone: 'time' },
        { label: moc ? 'Thế năng (mốc sàn)' : 'Thế năng', value: hide(q.mode === 'W' || moc, `${fmtG(W)} J`), tone: 'b' },
        ...(moc ? [{ label: 'Thế năng (mốc mặt bàn)', value: hide(true, `${fmtG(W2)} J`) }] : []),
      ]}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />}
      fields={
        <>
          <RangeField id="m" label="Khối lượng" tone="a" min={0.5} max={50} step={0.5}
            value={q.m} display={`${fmtG(q.m)} kg`} onChange={(x) => update({ m: x })} hidden={q.mode === 'm'} />
          <RangeField id="h" label="Độ cao" tone="t" min={0.5} max={30} step={0.5}
            value={q.h} display={`${fmt(q.h)} m`} onChange={(x) => update({ h: x })} hidden={q.mode === 'h'} />
          <RangeField id="W" label="Thế năng" tone="b" min={10} max={3000} step={10}
            value={q.W} display={`${fmtG(q.W)} J`} onChange={(x) => update({ W: x })} hidden={q.mode === 'W' || moc} />
          <RangeField id="hb" label="Độ cao mặt bàn" tone="b" min={0.5} max={1.5} step={0.1}
            value={q.hb} display={`${fmt(q.hb)} m`} onChange={(x) => update({ hb: x })} hidden={!moc} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Thế năng trọng trường', text: 'năng lượng vật có được do ở độ cao so với mốc thế năng' },
        { term: 'Công thức', text: `$${WT} = P \\times h = 10 \\times m \\times h$ ($h$: m, $${WT}$: J)` },
        { term: 'Mốc thế năng', text: 'thường chọn tại mặt đất; vật ở mốc thì $W_\\text{t} = 0$, đổi mốc thì thế năng đổi theo' },
      ]}
      playLabels={LABELS}
    />
  );
}
