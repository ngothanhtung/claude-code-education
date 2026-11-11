'use client';

import type p5 from 'p5';
import { MassSolution, StoichSolution, computeMass, computeStoich, type Given, type MassSpecies, type Target } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import Molecule3D from '@/components/Molecule3D';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { coefOf, f4, type Reaction } from '@/lib/chem';
import { drawFlow, drawReactionScene, reactionBars } from '@/lib/draw/reaction';
import { fmt } from '@/lib/format';
import { EXERCISES } from './exercises';

/** thuyphan: tạo glucose; ruou: sản xuất ethylic alcohol; quanghop: cây xanh tạo tinh bột */
export type Mode = 'thuyphan' | 'ruou' | 'quanghop';
export type RawId = 'tinhbot' | 'gao' | 'ngo' | 'san' | 'munca';

export interface Params {
  mode: Mode;
  raw: RawId;
  mRaw: number;
  pct: number; // % tinh bột / cellulose trong nguyên liệu
  H: number; // hiệu suất cả quá trình %
  unit: 'tấn' | 'kg';
  n: number; // mol mắt xích (quang hợp)
}

const RAWS: Record<RawId, { name: string; polymer: 'tinh bột' | 'cellulose' }> = {
  tinhbot: { name: 'tinh bột', polymer: 'tinh bột' },
  gao: { name: 'gạo', polymer: 'tinh bột' },
  ngo: { name: 'ngô', polymer: 'tinh bột' },
  san: { name: 'sắn', polymer: 'tinh bột' },
  munca: { name: 'mùn cưa', polymer: 'cellulose' },
};

const MODE_OPTIONS = [
  { value: 'thuyphan', label: 'Thủy phân tạo glucose' },
  { value: 'ruou', label: 'Sản xuất ethylic alcohol' },
  { value: 'quanghop', label: 'Quang hợp' },
] as const;
const RAW_OPTIONS = (Object.keys(RAWS) as RawId[]).map((k) => ({ value: k, label: RAWS[k].name }));
const UNIT_OPTIONS = [
  { value: 'tấn', label: 'tấn' },
  { value: 'kg', label: 'kg' },
] as const;

const POLY: MassSpecies = { f: 'C6H10O5', k: 1, tex: '(\\mathrm{C_6H_{10}O_5})_n', M: 162 };
const GLU: MassSpecies = { f: 'C6H12O6', k: 1 };
const ETH: MassSpecies = { f: 'C2H5OH', k: 2 };

const PHOTO: Reaction = { left: [{ f: 'CO2', k: 6 }, { f: 'H2O', k: 5 }], right: [{ f: 'C6H10O5', k: 1 }, { f: 'O2', k: 6 }] };
const PHOTO_TARGETS: Target[] = [{ f: 'CO2', kind: 'V' }, { f: 'O2', kind: 'V' }];

const COL_GLU = '#0C9A88';
const LABELS: PlayLabels = { start: 'Bắt đầu', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };

/** Nguyên liệu "tinh bột" là chất nguyên chất */
function fix(q: Params): Params {
  return q.raw === 'tinhbot' && q.pct !== 100 ? { ...q, pct: 100 } : q;
}

export default function TinhBotCelluloseLesson() {
  const ex = useExercises(EXERCISES, fix);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };
  const show = sim.revealed;
  const raw = RAWS[q.raw];
  const polyName = raw.polymer;

  let problem;
  let solution;
  let draw: (p: p5) => void;
  let readout;

  if (q.mode === 'quanghop') {
    const given: Given = { f: 'C6H10O5', kind: 'm', value: q.n * 162 };
    const st = computeStoich(PHOTO, given, PHOTO_TARGETS);
    const nOf = (f: string) => (q.n * coefOf(PHOTO, f)) / coefOf(PHOTO, 'C6H10O5');
    problem = (
      <p>
        Để tạo ra <Num tone="a">{f4(given.value)} g</Num> tinh bột, cây xanh cần hấp thụ bao nhiêu lít khí CO₂ và giải
        phóng bao nhiêu lít khí O₂ (đkc)?
      </p>
    );
    solution = (
      <StoichSolution
        r={PHOTO}
        given={given}
        targets={PHOTO_TARGETS}
        show={show}
        names={{ C6H10O5: 'mắt xích $\\mathrm{C_6H_{10}O_5}$' }}
        equation={'6n\\mathrm{CO_2} + 5n\\mathrm{H_2O} \\xrightarrow{\\text{ánh sáng, diệp lục}} (\\mathrm{C_6H_{10}O_5})_n + 6n\\mathrm{O_2}'}
      />
    );
    draw = (p) =>
      drawReactionScene(p, {
        reaction: PHOTO,
        equation: '6nCO₂ + 5nH₂O →(ánh sáng) (C₆H₁₀O₅)ₙ + 6nO₂',
        bars: reactionBars(PHOTO, nOf, ['C6H10O5'], show, f4),
        captions: ['Lá cây hấp thụ CO₂ và nước', 'Quang hợp tạo tinh bột, giải phóng O₂', 'Tinh bột tích lũy trong hạt, củ, quả'],
        t: sim.t,
        started: sim.started,
        done: sim.done,
      });
    readout = [
      { label: 'Tinh bột', value: `${f4(given.value)} g`, tone: 'time' as const },
      { label: 'CO₂ hấp thụ', value: show ? `${f4(st.items[0].value)} L` : '? L', tone: 'a' as const },
      { label: 'O₂ giải phóng', value: show ? `${f4(st.items[1].value)} L` : '? L', tone: 'b' as const },
    ];
  } else {
    const ruou = q.mode === 'ruou';
    const target = ruou ? ETH : GLU;
    const res = computeMass(q.mRaw, q.pct, POLY, [target], q.H);
    const out = res.items[0].value;
    const equation = ruou
      ? '(\\mathrm{C_6H_{10}O_5})_n \\rightarrow n\\mathrm{C_6H_{12}O_6} \\rightarrow 2n\\mathrm{C_2H_5OH}'
      : '(\\mathrm{C_6H_{10}O_5})_n + n\\mathrm{H_2O} \\xrightarrow{\\text{acid},\\ t^\\circ} n\\mathrm{C_6H_{12}O_6}';
    problem = (
      <p>
        {ruou ? 'Dùng' : 'Thủy phân'} <Num tone="a">{fmt(q.mRaw)} {q.unit}</Num> {raw.name}
        {q.pct < 100 && <> chứa <Num tone="t">{q.pct}%</Num> {polyName}</>}
        {ruou ? ' để sản xuất ethylic alcohol' : ''}, hiệu suất cả quá trình là <Num tone="b">{q.H}%</Num>. Tính khối lượng{' '}
        {ruou ? 'ethylic alcohol' : 'glucose'} thu được.
      </p>
    );
    solution = (
      <MassSolution
        raw={raw.name}
        mRaw={q.mRaw}
        pct={q.pct}
        A={POLY}
        targets={[target]}
        H={q.H}
        unitName={q.unit}
        equation={equation}
        eqLabel={ruou ? 'Sơ đồ quá trình (thủy phân rồi lên men):' : undefined}
        ratioIntro={ruou ? 'Theo sơ đồ' : undefined}
        show={show}
      />
    );
    const steps = [
      { title: raw.name, value: `${fmt(q.mRaw)} ${q.unit}`, col: '#B98B52' },
      ...(q.pct < 100 ? [{ title: polyName, value: `${f4(res.mA)} ${q.unit}`, col: '#8C7A60' }] : []),
      { title: 'glucose', value: ruou ? '…' : show ? `${f4(out)} ${q.unit}` : `? ${q.unit}`, col: COL_GLU },
      ...(ruou ? [{ title: 'ethylic alcohol', value: show ? `${f4(out)} ${q.unit}` : `? ${q.unit}`, col: '#5B45B8' }] : []),
    ];
    const arrows = [...(q.pct < 100 ? [`${q.pct}% ${polyName}`] : []), `thủy phân${ruou ? '' : `, H = ${q.H}%`}`, ...(ruou ? [`lên men, H = ${q.H}%`] : [])];
    draw = (p) =>
      drawFlow(
        p,
        steps,
        arrows,
        sim.t,
        ruou
          ? [`Sản xuất ethylic alcohol từ ${raw.name}`, 'Tinh bột → glucose → ethylic alcohol', 'Khối lượng thực tế = lí thuyết × H : 100']
          : [`Thủy phân ${polyName} trong ${raw.name}`, `${polyName} + nước → glucose (xúc tác acid, đun nóng)`, 'Khối lượng thực tế = lí thuyết × H : 100'],
        sim.started,
        sim.done,
      );
    readout = [
      { label: polyName, value: `${f4(res.mA)} ${q.unit}`, tone: 'time' as const },
      { label: 'Theo lí thuyết', value: show ? `${f4(res.items[0].theory)} ${q.unit}` : `? ${q.unit}`, tone: 'a' as const },
      { label: ruou ? 'Ethylic alcohol' : 'Glucose', value: show ? `${f4(out)} ${q.unit}` : `? ${q.unit}`, tone: 'b' as const },
    ];
  }

  const flowMode = q.mode !== 'quanghop';
  return (
    <LessonLayout
      slug="tinh-bot-cellulose"
      sim={sim}
      exercises={ex}
      media={<Molecule3D
          files={['maltose', 'cellobiose', 'glucose']}
          value={q.raw === 'munca' ? 'cellobiose' : 'maltose'}
          groups={[{ label: 'tinh bột (nối α) – cellulose (nối β)', files: ['maltose', 'cellobiose'] }]}
        />}
      problem={problem}
      draw={draw}
      canvasLabel={flowMode ? 'Sơ đồ quy trình từ nguyên liệu đến sản phẩm, mỗi khối ghi khối lượng.' : 'Phương trình quang hợp tạo tinh bột; các thanh là số mol từng chất.'}
      readout={readout}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          {flowMode && <Segmented name="raw" legend="Nguyên liệu" options={RAW_OPTIONS} value={q.raw} onChange={(v) => update({ raw: v })} />}
          {flowMode && <Segmented name="unit" legend="Đơn vị" options={UNIT_OPTIONS} value={q.unit} onChange={(v) => update({ unit: v })} />}
        </>
      }
      fields={
        <>
          <RangeField id="mRaw" label={`Khối lượng ${raw.name}`} tone="a" min={0.1} max={100} step={0.1}
            value={q.mRaw} display={`${fmt(q.mRaw)} ${q.unit}`} onChange={(x) => update({ mRaw: x })} hidden={!flowMode} />
          <RangeField id="pct" label={`Hàm lượng ${polyName}`} tone="t" min={10} max={100} step={1}
            value={q.pct} display={`${q.pct}%`} onChange={(x) => update({ pct: x })} hidden={!flowMode || q.raw === 'tinhbot'} />
          <RangeField id="H" label="Hiệu suất cả quá trình" tone="b" min={30} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => update({ H: x })} hidden={!flowMode} />
          <RangeField id="n" label="Khối lượng tinh bột tạo thành" tone="a" min={0.05} max={2} step={0.05}
            value={q.n} display={`${f4(q.n * 162)} g`} onChange={(x) => update({ n: x })} hidden={flowMode} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Tinh bột, cellulose', text: 'cùng công thức $(\\mathrm{C_6H_{10}O_5})_n$; tinh bột có trong hạt, củ; cellulose trong gỗ, bông' },
        { term: 'Thủy phân', text: 'tạo glucose khi đun với acid loãng (hoặc nhờ enzyme)' },
        { term: 'Nhận biết tinh bột', text: 'iodine làm tinh bột chuyển màu xanh tím' },
        { term: 'Mắt xích', text: '$M_{\\mathrm{C_6H_{10}O_5}} = 162$; glucose $M = 180$' },
      ]}
      playLabels={LABELS}
    />
  );
}

