'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import {
  VM, coefOf, combustion, cu, e4, eqTex, eqUni, mOf, massOf, molFromMass, molFromVolume, molRatio, molarMass, N4, VOf, volumeOf,
  type Reaction,
  f4,
} from '@/lib/chem';
import { fmt } from '@/lib/format';
import { u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawReactionScene } from '@/lib/draw/reaction';

/** dot: đốt cháy; the: thế với chlorine (ánh sáng) */
export type Mode = 'dot' | 'the';
export type AlkaneId = 'CH4' | 'C2H6' | 'C3H8' | 'C4H10';

export interface Params {
  mode: Mode;
  mol: AlkaneId;
  /** đề cho thể tích (đkc) hay khối lượng alkane */
  given: 'V' | 'm';
  n: number; // mol alkane (thanh trượt), đề hiển thị V hoặc m tương ứng
}

const NAMES: Record<AlkaneId, string> = { CH4: 'methane', C2H6: 'ethane', C3H8: 'propane', C4H10: 'butane' };
const CHLORIDE: Record<AlkaneId, string> = { CH4: 'CH3Cl', C2H6: 'C2H5Cl', C3H8: 'C3H7Cl', C4H10: 'C4H9Cl' };

const MODE_OPTIONS = [
  { value: 'dot', label: 'Đốt cháy' },
  { value: 'the', label: 'Thế với chlorine' },
] as const;
const MOL_OPTIONS = (Object.keys(NAMES) as AlkaneId[]).map((k) => ({ value: k, label: cu(k) }));
const GIVEN_OPTIONS = [
  { value: 'V', label: 'Thể tích' },
  { value: 'm', label: 'Khối lượng' },
] as const;

const LABELS: PlayLabels = { start: 'Cho phản ứng', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };

export default function AlkaneLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const show = sim.revealed;
  const dot = q.mode === 'dot';
  const r: Reaction = dot
    ? combustion(q.mol)
    : { left: [{ f: q.mol, k: 1 }, { f: 'Cl2', k: 1 }], right: [{ f: CHLORIDE[q.mol], k: 1 }, { f: 'HCl', k: 1 }] };
  const cond = dot ? 't^\\circ' : '\\text{ánh sáng}';
  const kA = coefOf(r, q.mol);
  const nOf = (f: string) => (q.n * coefOf(r, f)) / kA;
  const M = molarMass(q.mol);
  const V = q.n * VM;
  const m = q.n * M;
  const givenText = q.given === 'V' ? `${f4(V)} L` : `${f4(m)} g`;
  const name = NAMES[q.mol];

  /** các đại lượng cần tìm */
  const targets: { f: string; kind: 'V' | 'm' }[] = dot
    ? [{ f: 'O2', kind: 'V' }, { f: 'CO2', kind: 'V' }, { f: 'H2O', kind: 'm' }]
    : [{ f: 'Cl2', kind: 'V' }, { f: CHLORIDE[q.mol], kind: 'm' }];
  const valueOf = (t: { f: string; kind: 'V' | 'm' }) => (t.kind === 'V' ? nOf(t.f) * VM : nOf(t.f) * molarMass(t.f));
  const symOf = (t: { f: string; kind: 'V' | 'm' }) => (t.kind === 'V' ? VOf(t.f) : mOf(t.f));
  const unitOf = (t: { kind: 'V' | 'm' }) => (t.kind === 'V' ? 'L' : 'g');

  const all = [...r.left, ...r.right];
  const maxN = Math.max(...all.map((s) => nOf(s.f)));
  const draw = (p: p5) =>
    drawReactionScene(p, {
      reaction: r,
      equation: eqUni(r.left, r.right, dot ? 't°' : 'ánh sáng'),
      bars: all.map((s) => ({
        label: cu(s.f),
        reactant: r.left.includes(s),
        frac: nOf(s.f) / maxN,
        text: s.f === q.mol || show ? `${f4(nOf(s.f))} mol` : '? mol',
      })),
      captions: dot
        ? [`Đốt cháy ${name} trong oxygen`, 'Alkane cháy tạo carbon dioxide và nước, tỏa nhiều nhiệt', 'Sản phẩm cháy: CO₂ và H₂O']
        : [`Trộn ${name} với chlorine, chiếu ánh sáng`, 'Một nguyên tử H được thay thế bằng một nguyên tử Cl', 'Phản ứng thế: tạo dẫn xuất chlorine và HCl'],
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const ask = dot
    ? 'thể tích khí oxygen cần dùng, thể tích khí carbon dioxide (đkc) và khối lượng nước tạo thành'
    : `thể tích khí chlorine (đkc) cần dùng và khối lượng ${cu(CHLORIDE[q.mol])} tạo thành (phản ứng thế một lần)`;
  const problem = (
    <p>
      {dot ? 'Đốt cháy hoàn toàn' : 'Cho'} <Num tone="a">{givenText}</Num> khí {name} ({cu(q.mol)})
      {q.given === 'V' ? ' ở điều kiện chuẩn' : ''}
      {dot ? ' trong khí oxygen' : ' tác dụng với khí chlorine khi có ánh sáng'}. Viết phương trình hóa học và tính {ask}.
    </p>
  );

  const solution = (
    <>
      <Summary given={[q.given === 'V' ? `${VOf(q.mol)} = ${N4(V)}${u('L')}` : `${mOf(q.mol)} = ${N4(m)}${u('g')}`]} find={targets.map(symOf)} />
      <Step>{`Số mol ${name}:`}</Step>
      <Calc tex={q.given === 'V' ? molFromVolume(q.mol, V, q.n, true) : molFromMass(q.mol, m, q.n, true)} />
      <Step>Phương trình hóa học:</Step>
      <Calc tex={eqTex(r.left, r.right, cond)} />
      <Step>Theo phương trình hóa học:</Step>
      {targets.map((t) => (
        <Calc key={t.f} tex={molRatio(t.f, coefOf(r, t.f), q.mol, kA, q.n, show, true)} />
      ))}
      <Step>Thể tích và khối lượng các chất:</Step>
      {targets.map((t) => (
        <Calc key={t.f} tex={t.kind === 'V' ? volumeOf(t.f, nOf(t.f), show) : massOf(t.f, nOf(t.f), show)} />
      ))}
      <Answer show={show} items={targets.map((t) => `$${symOf(t)} ${e4(valueOf(t))} ${N4(valueOf(t))}${u(unitOf(t))}$`)} />
    </>
  );

  return (
    <LessonLayout
      slug="alkane"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Phương trình hóa học bằng mô hình phân tử: chất tham gia mờ dần, sản phẩm hiện dần; các thanh dưới là số mol từng chất."
      readout={[
        { label: `Số mol ${cu(q.mol)}`, value: `${f4(q.n)} mol`, tone: 'time' },
        ...targets.slice(0, 2).map((t, i) => ({
          label: `${t.kind === 'V' ? 'Thể tích' : 'Khối lượng'} ${cu(t.f)}`,
          value: show ? `${f4(valueOf(t))} ${unitOf(t)}` : `? ${unitOf(t)}`,
          tone: (i === 0 ? 'a' : 'b') as 'a' | 'b',
        })),
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          <Segmented name="mol" legend="Alkane" options={MOL_OPTIONS} value={q.mol} onChange={(v) => update({ mol: v })} />
          <Segmented name="given" legend="Đề cho" options={GIVEN_OPTIONS} value={q.given} onChange={(v) => update({ given: v })} />
        </>
      }
      fields={
        <RangeField id="n" label={`Lượng ${cu(q.mol)} (${fmt(q.n, 2)} mol)`} tone="a" min={0.05} max={2} step={0.05}
          value={q.n} display={givenText} onChange={(x) => update({ n: x })} />
      }
      solution={solution}
      rules={[
        { term: 'Alkane', text: 'hydrocarbon mạch hở chỉ có liên kết đơn, công thức chung $\\mathrm{C_nH_{2n+2}}$' },
        { term: 'Đốt cháy', text: 'alkane + oxygen → carbon dioxide + nước, tỏa nhiều nhiệt' },
        { term: 'Phản ứng thế', text: '$\\mathrm{CH_4} + \\mathrm{Cl_2} \\xrightarrow{\\text{ánh sáng}} \\mathrm{CH_3Cl} + \\mathrm{HCl}$' },
        { term: 'Công thức', text: '$n = V \\chia 24{,}79$; $n = m \\chia M$' },
      ]}
      playLabels={LABELS}
    />
  );
}

