'use client';

import type p5 from 'p5';
import { StoichSolution, computeStoich, type Given, type Target } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import Molecule3D from '@/components/Molecule3D';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { coefOf, combustion, cu, e4, eqUni, f4, molarMass, N4, type Reaction } from '@/lib/chem';
import { drawReactionScene, reactionBars } from '@/lib/draw/reaction';
import { B, U, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawAlcohol } from './sketch';

/** dot: đốt cháy; na: tác dụng với sodium; docon: độ cồn; lenmen: lên men glucose */
export type Mode = 'dot' | 'na' | 'docon' | 'lenmen';

export interface Params {
  mode: Mode;
  n: number; // mol ethylic alcohol (dot, na) hoặc glucose (lenmen)
  Vdd: number; // mL dung dịch rượu
  deg: number; // độ cồn
  H: number; // hiệu suất lên men %
}

const MODE_OPTIONS = [
  { value: 'dot', label: 'Đốt cháy' },
  { value: 'na', label: 'Tác dụng với sodium' },
  { value: 'docon', label: 'Độ cồn' },
  { value: 'lenmen', label: 'Lên men glucose' },
] as const;

const REACTIONS: Record<'dot' | 'na' | 'lenmen', { r: Reaction; cond?: string; uni?: string; given: string; targets: Target[] }> = {
  dot: { r: combustion('C2H5OH'), cond: 't^\\circ', uni: 't°', given: 'C2H5OH', targets: [{ f: 'O2', kind: 'V' }, { f: 'CO2', kind: 'V' }, { f: 'H2O', kind: 'm' }] },
  na: {
    r: { left: [{ f: 'C2H5OH', k: 2 }, { f: 'Na', k: 2 }], right: [{ f: 'C2H5ONa', k: 2 }, { f: 'H2', k: 1 }] },
    given: 'C2H5OH',
    targets: [{ f: 'H2', kind: 'V' }, { f: 'C2H5ONa', kind: 'm' }],
  },
  lenmen: {
    r: { left: [{ f: 'C6H12O6', k: 1 }], right: [{ f: 'C2H5OH', k: 2 }, { f: 'CO2', k: 2 }] },
    cond: '\\text{men rượu, 30–35}^\\circ\\text{C}',
    uni: 'men rượu',
    given: 'C6H12O6',
    targets: [{ f: 'C2H5OH', kind: 'm' }, { f: 'CO2', kind: 'V' }],
  },
};

const NAMES: Record<string, string> = { C2H5OH: 'ethylic alcohol', C6H12O6: 'glucose' };
const LABELS: PlayLabels = { start: 'Cho phản ứng', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };
const D = 0.8; // g/mL

export default function EthylicAlcoholLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };
  const show = sim.revealed;

  let problem;
  let solution;
  let draw: (p: p5) => void;
  let readout;

  if (q.mode === 'docon') {
    const V = (q.Vdd * q.deg) / 100;
    const m = V * D;
    problem = (
      <p>
        Một chai rượu có ghi <Num tone="t">{q.deg}°</Num>, chứa <Num tone="a">{q.Vdd} mL</Num> dung dịch. Tính thể tích và
        khối lượng ethylic alcohol nguyên chất có trong chai, biết khối lượng riêng của ethylic alcohol là 0,8 g/mL.
      </p>
    );
    solution = (
      <>
        <Summary given={[`V_\\text{dd} = ${q.Vdd}${u('mL')};\\ ${q.deg}^\\circ;\\ D = 0{,}8${u('g/mL')}`]} find={['V_\\text{rượu}', 'm_\\text{rượu}']} />
        <Step>{`Rượu ${q.deg}° nghĩa là trong 100 mL dung dịch có ${q.deg} mL ethylic alcohol nguyên chất.`}</Step>
        <Step>Thể tích ethylic alcohol nguyên chất:</Step>
        <Calc tex={`V_\\text{rượu} = ${q.Vdd} \\times ${q.deg} \\chia 100 ${e4(V)} ${B(show, N4(V))}${U('mL')}`} />
        <Step>Khối lượng ethylic alcohol:</Step>
        <Calc tex={`m = V \\times D = ${B(show, N4(V))} \\times 0{,}8 ${e4(m)} ${B(show, N4(m))}${U('g')}`} />
        <Answer show={show} items={[`$V_\\text{rượu} ${e4(V)} ${N4(V)}${u('mL')}$`, `$m_\\text{rượu} ${e4(m)} ${N4(m)}${u('g')}$`]} />
      </>
    );
    draw = (p) => drawAlcohol(p, { Vdd: q.Vdd, deg: q.deg, alcoholText: show ? `${f4(V)} mL` : '? mL', t: sim.t, started: sim.started, done: sim.done });
    readout = [
      { label: 'Dung dịch', value: `${q.Vdd} mL`, tone: 'time' as const },
      { label: 'Rượu nguyên chất', value: show ? `${f4(V)} mL` : '? mL', tone: 'a' as const },
      { label: 'Khối lượng', value: show ? `${f4(m)} g` : '? g', tone: 'b' as const },
    ];
  } else {
    const R = REACTIONS[q.mode];
    const H = q.mode === 'lenmen' ? q.H : 100;
    const given: Given = { f: R.given, kind: 'm', value: q.n * molarMass(R.given) };
    const st = computeStoich(R.r, given, R.targets, H);
    const nOf = (f: string) => (q.n * coefOf(R.r, f)) / coefOf(R.r, R.given);
    const ask = R.targets.map((t) => `${t.kind === 'V' ? 'thể tích' : 'khối lượng'} ${cu(t.f)}`).join(', ');
    problem =
      q.mode === 'dot' ? (
        <p>
          Đốt cháy hoàn toàn <Num tone="a">{f4(given.value)} g</Num> ethylic alcohol (C₂H₅OH). Tính thể tích khí oxygen cần
          dùng, thể tích khí carbon dioxide (đkc) và khối lượng nước tạo thành.
        </p>
      ) : q.mode === 'na' ? (
        <p>
          Cho <Num tone="a">{f4(given.value)} g</Num> ethylic alcohol tác dụng với sodium dư. Tính thể tích khí hydrogen
          thoát ra (đkc) và khối lượng sodium ethylate (C₂H₅ONa) tạo thành.
        </p>
      ) : (
        <p>
          Lên men <Num tone="a">{f4(given.value)} g</Num> glucose với hiệu suất <Num tone="b">{q.H}%</Num>. Tính {ask} (đkc)
          thu được.
        </p>
      );
    solution = <StoichSolution r={R.r} cond={R.cond} given={given} targets={R.targets} H={H} show={show} names={NAMES} />;
    draw = (p) =>
      drawReactionScene(p, {
        reaction: R.r,
        equation: eqUni(R.r.left, R.r.right, R.uni),
        bars: reactionBars(R.r, nOf, [R.given], show, f4),
        captions:
          q.mode === 'dot'
            ? ['Đốt ethylic alcohol trong không khí', 'Ethylic alcohol cháy với ngọn lửa màu xanh, tỏa nhiều nhiệt', 'Sản phẩm: CO₂ và H₂O']
            : q.mode === 'na'
              ? ['Thả mẩu sodium vào ethylic alcohol', 'Nguyên tử H của nhóm –OH bị sodium thay thế, khí H₂ thoát ra', 'Sản phẩm: sodium ethylate và khí hydrogen']
              : ['Lên men dung dịch glucose nhờ men rượu', 'Glucose chuyển thành ethylic alcohol và khí CO₂', 'Thu được ethylic alcohol (theo hiệu suất)'],
        t: sim.t,
        started: sim.started,
        done: sim.done,
      });
    readout = [
      { label: `Số mol ${cu(R.given)}`, value: `${f4(st.nGiven)} mol`, tone: 'time' as const },
      ...st.items.slice(0, 2).map((it, i) => ({
        label: `${it.kind === 'V' ? 'Thể tích' : 'Khối lượng'} ${cu(it.f)}`,
        value: show ? `${f4(it.value)} ${it.kind === 'V' ? 'L' : 'g'}` : `? ${it.kind === 'V' ? 'L' : 'g'}`,
        tone: (i === 0 ? 'a' : 'b') as 'a' | 'b',
      })),
    ];
  }

  const M = q.mode === 'lenmen' ? 180 : 46;
  return (
    <LessonLayout
      slug="ethylic-alcohol"
      sim={sim}
      exercises={ex}
      media={<Molecule3D files={['ethanol']} groups={[{ label: 'đồng phân C₂H₆O', files: ['ethanol', 'dimethyl-ether'] }]} />}
      problem={problem}
      draw={draw}
      canvasLabel={
        q.mode === 'docon'
          ? 'Ống đong chứa dung dịch rượu; phần ethylic alcohol nguyên chất được tô màu tím theo độ cồn.'
          : 'Phương trình hóa học bằng mô hình phân tử; các thanh dưới là số mol từng chất.'
      }
      readout={readout}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />}
      fields={
        <>
          <RangeField id="n" label={q.mode === 'lenmen' ? 'Khối lượng glucose' : 'Khối lượng ethylic alcohol'} tone="a" min={0.05} max={5} step={0.05}
            value={q.n} display={`${f4(q.n * M)} g`} onChange={(x) => update({ n: x })} hidden={q.mode === 'docon'} />
          <RangeField id="Vdd" label="Thể tích dung dịch rượu" tone="a" min={10} max={1000} step={10}
            value={q.Vdd} display={`${q.Vdd} mL`} onChange={(x) => update({ Vdd: x })} hidden={q.mode !== 'docon'} />
          <RangeField id="deg" label="Độ cồn" tone="t" min={1} max={60} step={1}
            value={q.deg} display={`${q.deg}°`} onChange={(x) => update({ deg: x })} hidden={q.mode !== 'docon'} />
          <RangeField id="H" label="Hiệu suất lên men" tone="b" min={50} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => update({ H: x })} hidden={q.mode !== 'lenmen'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Ethylic alcohol', text: '$\\mathrm{C_2H_5OH}$ (hay $\\mathrm{CH_3CH_2OH}$), có nhóm –OH; chất lỏng, tan vô hạn trong nước' },
        { term: 'Phản ứng', text: 'cháy tạo $\\mathrm{CO_2}$, $\\mathrm{H_2O}$; tác dụng với Na giải phóng $\\mathrm{H_2}$' },
        { term: 'Độ cồn', text: 'số mL ethylic alcohol nguyên chất trong 100 mL dung dịch' },
        { term: 'Điều chế', text: '$\\mathrm{C_6H_{12}O_6} \\xrightarrow{\\text{men rượu}} 2\\mathrm{C_2H_5OH} + 2\\mathrm{CO_2}$' },
      ]}
      playLabels={LABELS}
    />
  );
}

