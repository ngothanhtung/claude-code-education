'use client';

import type p5 from 'p5';
import { MassSolution, computeMass, type MassSpecies } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { cu, f4 } from '@/lib/chem';
import { fmt } from '@/lib/format';
import { EXERCISES } from './exercises';
import { drawLime } from './sketch';

/** nungvoi: nung đá vôi; toivoi: tôi vôi; thuytinh: nấu thủy tinh từ cát */
export type Mode = 'nungvoi' | 'toivoi' | 'thuytinh';

export interface Params {
  mode: Mode;
  mRaw: number;
  pct: number; // % CaCO3 trong đá vôi hoặc % SiO2 trong cát
  H: number; // %
}

const MODE_OPTIONS = [
  { value: 'nungvoi', label: 'Nung vôi' },
  { value: 'toivoi', label: 'Tôi vôi' },
  { value: 'thuytinh', label: 'Nấu thủy tinh' },
] as const;

interface Setup {
  raw: string;
  unit: string;
  A: MassSpecies;
  targets: MassSpecies[];
  equation: string;
  uni: string;
  fixed: boolean; // tôi vôi: vôi sống nguyên chất, phản ứng hoàn toàn
}

const SETUPS: Record<Mode, Setup> = {
  nungvoi: {
    raw: 'đá vôi', unit: 'tấn', A: { f: 'CaCO3', k: 1 }, targets: [{ f: 'CaO', k: 1 }, { f: 'CO2', k: 1 }],
    equation: '\\mathrm{CaCO_3} \\xrightarrow{t^\\circ} \\mathrm{CaO} + \\mathrm{CO_2}', uni: 'CaCO₃ →(t°) CaO + CO₂', fixed: false,
  },
  toivoi: {
    raw: 'vôi sống', unit: 'kg', A: { f: 'CaO', k: 1 }, targets: [{ f: 'Ca(OH)2', k: 1 }],
    equation: '\\mathrm{CaO} + \\mathrm{H_2O} \\rightarrow \\mathrm{Ca(OH)_2}', uni: 'CaO + H₂O → Ca(OH)₂', fixed: true,
  },
  thuytinh: {
    raw: 'cát', unit: 'tấn', A: { f: 'SiO2', k: 1 }, targets: [{ f: 'Na2SiO3', k: 1 }],
    equation: '\\mathrm{SiO_2} + \\mathrm{Na_2CO_3} \\xrightarrow{t^\\circ} \\mathrm{Na_2SiO_3} + \\mathrm{CO_2}', uni: 'SiO₂ + Na₂CO₃ →(t°) Na₂SiO₃ + CO₂', fixed: false,
  },
};

const LABELS: PlayLabels = { start: 'Bắt đầu', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };

export default function DaVoiSilicateLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };
  const show = sim.revealed;
  const S = SETUPS[q.mode];
  const pct = S.fixed ? 100 : q.pct;
  const H = S.fixed ? 100 : q.H;
  const res = computeMass(q.mRaw, pct, S.A, S.targets, H);

  const problem =
    q.mode === 'nungvoi' ? (
      <p>
        Nung <Num tone="a">{fmt(q.mRaw)} tấn</Num> đá vôi chứa <Num tone="t">{pct}%</Num> CaCO₃ (còn lại là tạp chất không bị
        phân hủy){H < 100 ? <>, hiệu suất <Num tone="b">{H}%</Num></> : ''}. Tính khối lượng vôi sống CaO và khí CO₂ tạo thành.
      </p>
    ) : q.mode === 'toivoi' ? (
      <p>
        Tôi <Num tone="a">{fmt(q.mRaw)} kg</Num> vôi sống CaO bằng nước dư. Tính khối lượng vôi tôi Ca(OH)₂ thu được.
      </p>
    ) : (
      <p>
        Nấu thủy tinh từ <Num tone="a">{fmt(q.mRaw)} tấn</Num> cát chứa <Num tone="t">{pct}%</Num> SiO₂ với soda (Na₂CO₃) dư
        {H < 100 ? <>, hiệu suất <Num tone="b">{H}%</Num></> : ''}. Tính khối lượng sodium silicate Na₂SiO₃ tạo thành.
      </p>
    );

  const draw = (p: p5) =>
    drawLime(p, {
      mode: q.mode,
      equation: S.uni,
      inLabel: cu(S.A.f),
      inText: `${f4(res.mA)} ${S.unit}`,
      outs: res.items.map((it) => ({ label: cu(it.sp.f), text: show ? `${f4(it.value)} ${S.unit}` : `? ${S.unit}` })),
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  return (
    <LessonLayout
      slug="da-voi-silicate"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel={q.mode === 'toivoi' ? 'Vôi sống cho vào nước tạo vôi tôi, tỏa nhiều nhiệt.' : 'Lò nung: nguyên liệu nạp từ trên, sản phẩm lấy ra ở đáy, khí CO₂ thoát ra.'}
      readout={[
        { label: cu(S.A.f), value: `${f4(res.mA)} ${S.unit}`, tone: 'time' },
        ...res.items.slice(0, 2).map((it, i) => ({
          label: cu(it.sp.f),
          value: show ? `${f4(it.value)} ${S.unit}` : `? ${S.unit}`,
          tone: (i === 0 ? 'a' : 'b') as 'a' | 'b',
        })),
      ]}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />}
      fields={
        <>
          <RangeField id="mRaw" label={`Khối lượng ${S.raw}`} tone="a" min={0.1} max={50} step={0.1}
            value={q.mRaw} display={`${fmt(q.mRaw)} ${S.unit}`} onChange={(v) => update({ mRaw: v })} />
          <RangeField id="pct" label={`Hàm lượng ${cu(S.A.f)}`} tone="t" min={50} max={100} step={1}
            value={q.pct} display={`${q.pct}%`} onChange={(v) => update({ pct: v })} hidden={S.fixed} />
          <RangeField id="H" label="Hiệu suất" tone="b" min={50} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(v) => update({ H: v })} hidden={S.fixed} />
        </>
      }
      solution={
        <MassSolution raw={S.raw} mRaw={q.mRaw} pct={pct} A={S.A} targets={S.targets} H={H} unitName={S.unit} equation={S.equation} show={show} />
      }
      rules={[
        { term: 'Đá vôi', text: 'thành phần chính $\\mathrm{CaCO_3}$; dùng sản xuất vôi, xi măng, thủy tinh, làm đá xây dựng' },
        { term: 'Nung vôi, tôi vôi', text: '$\\mathrm{CaCO_3} \\xrightarrow{t^\\circ} \\mathrm{CaO} + \\mathrm{CO_2}$; $\\mathrm{CaO} + \\mathrm{H_2O} \\rightarrow \\mathrm{Ca(OH)_2}$' },
        { term: 'Công nghiệp silicate', text: 'sản xuất đồ gốm, xi măng, thủy tinh từ đất sét, đá vôi, cát' },
      ]}
      playLabels={LABELS}
    />
  );
}
