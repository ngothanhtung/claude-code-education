'use client';

import type p5 from 'p5';
import { StoichSolution, computeStoich, type Given, type Target } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { coefOf, cu, eqUni, f4, molarMass, type Reaction } from '@/lib/chem';
import { drawReactionScene, reactionBars } from '@/lib/draw/reaction';
import { EXERCISES } from './exercises';

/** trangbac: tráng bạc; lenmen: lên men rượu; thuyphan: thủy phân saccharose; quanghop: quang hợp */
export type Mode = 'trangbac' | 'lenmen' | 'thuyphan' | 'quanghop';

export interface Params {
  mode: Mode;
  n: number; // mol glucose (hoặc saccharose khi thủy phân)
  H: number; // %
}

const MODE_OPTIONS = [
  { value: 'trangbac', label: 'Tráng bạc' },
  { value: 'lenmen', label: 'Lên men rượu' },
  { value: 'thuyphan', label: 'Thủy phân saccharose' },
  { value: 'quanghop', label: 'Quang hợp' },
] as const;

const GLU = 'C6H12O6';
const SAC = 'C12H22O11';

interface Setup {
  r: Reaction;
  cond?: string;
  uni?: string;
  given: string;
  targets: Target[];
  equation?: string;
  captions: [string, string, string];
}

const SETUPS: Record<Mode, Setup> = {
  trangbac: {
    r: { left: [{ f: GLU, k: 1 }, { f: 'Ag2O', k: 1 }], right: [{ f: 'C6H12O7', k: 1 }, { f: 'Ag', k: 2 }] },
    cond: '\\mathrm{NH_3},\\ t^\\circ',
    uni: 'NH₃, t°',
    given: GLU,
    targets: [{ f: 'Ag', kind: 'm' }],
    captions: ['Đun nhẹ glucose với dung dịch AgNO₃ trong NH₃', 'Bạc sinh ra bám vào thành ống nghiệm sáng như gương', 'Phản ứng tráng bạc dùng để tráng gương, ruột phích'],
  },
  lenmen: {
    r: { left: [{ f: GLU, k: 1 }], right: [{ f: 'C2H5OH', k: 2 }, { f: 'CO2', k: 2 }] },
    cond: '\\text{men rượu, 30–35}^\\circ\\text{C}',
    uni: 'men rượu',
    given: GLU,
    targets: [{ f: 'C2H5OH', kind: 'm' }, { f: 'CO2', kind: 'V' }],
    captions: ['Cho men rượu vào dung dịch glucose', 'Glucose lên men tạo ethylic alcohol và khí CO₂', 'Thu được ethylic alcohol theo hiệu suất'],
  },
  thuyphan: {
    r: { left: [{ f: SAC, k: 1 }, { f: 'H2O', k: 1 }], right: [{ f: GLU, k: 1 }, { f: GLU, k: 1 }] },
    given: SAC,
    targets: [{ f: GLU, kind: 'm' }],
    equation:
      '\\mathrm{C_{12}H_{22}O_{11}} + \\mathrm{H_2O} \\xrightarrow{\\text{acid},\\ t^\\circ} \\mathrm{C_6H_{12}O_6}\\,(\\text{glucose}) + \\mathrm{C_6H_{12}O_6}\\,(\\text{fructose})',
    captions: ['Đun dung dịch saccharose với acid loãng', 'Saccharose bị thủy phân thành glucose và fructose', 'Glucose và fructose có cùng công thức C₆H₁₂O₆'],
  },
  quanghop: {
    r: { left: [{ f: 'CO2', k: 6 }, { f: 'H2O', k: 6 }], right: [{ f: GLU, k: 1 }, { f: 'O2', k: 6 }] },
    cond: '\\text{ánh sáng, diệp lục}',
    uni: 'ánh sáng',
    given: GLU,
    targets: [{ f: 'CO2', kind: 'V' }, { f: 'O2', kind: 'V' }],
    captions: ['Lá cây hấp thụ CO₂ và nước dưới ánh sáng mặt trời', 'Chất diệp lục giúp tạo glucose và giải phóng oxygen', 'Quang hợp tạo glucose cho cây và O₂ cho khí quyển'],
  },
};

const NAMES: Record<string, string> = { [GLU]: 'glucose', [SAC]: 'saccharose' };
const LABELS: PlayLabels = { start: 'Cho phản ứng', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };

export default function GlucoseSaccharoseLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };
  const show = sim.revealed;

  const S = SETUPS[q.mode];
  const H = q.mode === 'quanghop' ? 100 : q.H;
  const given: Given = { f: S.given, kind: 'm', value: q.n * molarMass(S.given) };
  const st = computeStoich(S.r, given, S.targets, H);
  const nOf = (f: string) => (q.n * coefOf(S.r, f)) / coefOf(S.r, S.given);
  const g = f4(given.value);
  const hText = H < 100 ? <>, hiệu suất <Num tone="b">{H}%</Num></> : null;

  const problem =
    q.mode === 'trangbac' ? (
      <p>
        Đun nóng dung dịch chứa <Num tone="a">{g} g</Num> glucose với lượng dư dung dịch AgNO₃ trong NH₃{hText}. Tính khối
        lượng bạc thu được.
      </p>
    ) : q.mode === 'lenmen' ? (
      <p>
        Lên men <Num tone="a">{g} g</Num> glucose{hText}. Tính khối lượng ethylic alcohol và thể tích khí CO₂ (đkc) thu được.
      </p>
    ) : q.mode === 'thuyphan' ? (
      <p>
        Thủy phân <Num tone="a">{g} g</Num> saccharose trong môi trường acid{hText}. Tính khối lượng glucose thu được.
      </p>
    ) : (
      <p>
        Để tạo ra <Num tone="a">{g} g</Num> glucose nhờ quang hợp, cây xanh cần hấp thụ bao nhiêu lít khí CO₂ và giải phóng
        bao nhiêu lít khí O₂ (đkc)?
      </p>
    );

  const draw = (p: p5) =>
    drawReactionScene(p, {
      reaction: S.r,
      equation: q.mode === 'thuyphan' ? 'C₁₂H₂₂O₁₁ + H₂O →(acid) glucose + fructose' : eqUni(S.r.left, S.r.right, S.uni),
      bars: reactionBars(S.r, nOf, [S.given], show, f4),
      captions: S.captions,
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  return (
    <LessonLayout
      slug="glucose-saccharose"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Phương trình hóa học bằng mô hình; các thanh dưới là số mol từng chất."
      readout={[
        { label: `Số mol ${NAMES[S.given]}`, value: `${f4(st.nGiven)} mol`, tone: 'time' },
        ...st.items.slice(0, 2).map((it, i) => ({
          label: `${it.kind === 'V' ? 'Thể tích' : 'Khối lượng'} ${it.f === GLU ? 'glucose' : cu(it.f)}`,
          value: show ? `${f4(it.value)} ${it.kind === 'V' ? 'L' : 'g'}` : `? ${it.kind === 'V' ? 'L' : 'g'}`,
          tone: (i === 0 ? 'a' : 'b') as 'a' | 'b',
        })),
      ]}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />}
      fields={
        <>
          <RangeField id="n" label={`Khối lượng ${NAMES[S.given]}`} tone="a" min={0.05} max={3} step={0.05}
            value={q.n} display={`${g} g`} onChange={(x) => update({ n: x })} />
          <RangeField id="H" label="Hiệu suất" tone="b" min={50} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => update({ H: x })} hidden={q.mode === 'quanghop'} />
        </>
      }
      solution={<StoichSolution r={S.r} cond={S.cond} equation={S.equation} given={given} targets={S.targets} H={H} show={show} names={NAMES} />}
      rules={[
        { term: 'Glucose', text: '$\\mathrm{C_6H_{12}O_6}$: chất rắn, vị ngọt, có trong quả chín (nho), mật ong' },
        { term: 'Saccharose', text: '$\\mathrm{C_{12}H_{22}O_{11}}$: đường mía, củ cải đường, thốt nốt' },
        { term: 'Tráng bạc', text: '$\\mathrm{C_6H_{12}O_6} + \\mathrm{Ag_2O} \\xrightarrow{\\mathrm{NH_3}} \\mathrm{C_6H_{12}O_7} + 2\\mathrm{Ag}$' },
        { term: 'Thủy phân saccharose', text: 'tạo glucose và fructose (cùng công thức $\\mathrm{C_6H_{12}O_6}$)' },
      ]}
      playLabels={LABELS}
    />
  );
}
