'use client';

import type p5 from 'p5';
import { MassSolution, computeMass, type MassSpecies } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, START_LABELS } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { e4, f4, N4 } from '@/lib/chem';
import { fmt, fmtG } from '@/lib/format';
import { B, N, U, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawCarbon } from './sketch';

/** xang: CO2 từ xe chạy xăng; than: CO2 từ đốt than; cay: số cây xanh cần để hấp thụ CO2 */
export type Mode = 'xang' | 'than' | 'cay';

export interface Params {
  mode: Mode;
  km: number;
  cons: number; // lít xăng cho 100 km
  coal: number; // tấn than
  pctC: number; // % carbon trong than
  co2: number; // kg CO2 cần hấp thụ
  absorb: number; // kg CO2 một cây hấp thụ mỗi năm
}

const MODE_OPTIONS = [
  { value: 'xang', label: 'Xe chạy xăng' },
  { value: 'than', label: 'Đốt than' },
  { value: 'cay', label: 'Trồng cây xanh' },
] as const;

const OCTANE: MassSpecies = { f: 'C8H18', k: 2 };
const CO2_16: MassSpecies = { f: 'CO2', k: 16 };
const C: MassSpecies = { f: 'C', k: 1 };
const CO2_1: MassSpecies = { f: 'CO2', k: 1 };
const D = 0.7; // kg/L


export default function NhienLieuHoaThachLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5, resetOn: ex.params });
  const show = sim.revealed;

  let problem;
  let solution;
  let emit = 0;
  let unit = 'kg';
  let readout;

  if (q.mode === 'xang') {
    const V = (q.km * q.cons) / 100;
    const m = V * D;
    const res = computeMass(m, 100, OCTANE, [CO2_16], 100);
    emit = res.items[0].value;
    problem = (
      <p>
        Một xe máy đi <Num tone="a">{fmtG(q.km)} km</Num>, cứ 100 km tiêu thụ <Num tone="t">{fmt(q.cons)} L</Num> xăng. Coi
        xăng là octane (C₈H₁₈) có khối lượng riêng 0,7 kg/L và cháy hoàn toàn. Tính khối lượng khí CO₂ xe thải ra.
      </p>
    );
    solution = (
      <MassSolution
        raw="xăng"
        mRaw={m}
        pct={100}
        A={OCTANE}
        targets={[CO2_16]}
        H={100}
        unitName="kg"
        equation={'2\\mathrm{C_8H_{18}} + 25\\mathrm{O_2} \\xrightarrow{t^\\circ} 16\\mathrm{CO_2} + 18\\mathrm{H_2O}'}
        given={[`s = ${N(q.km)}${u('km')};\\ ${N(q.cons)}${u('L mỗi 100 km')};\\ D = 0{,}7${u('kg/L')}`]}
        lead={
          <>
            <Step>Thể tích và khối lượng xăng đã dùng:</Step>
            <Calc tex={`V = ${N(q.km)} \\times ${N(q.cons)} \\chia 100 ${e4(V)} ${N4(V)}${U('L')}`} />
            <Calc tex={`m = V \\times D = ${N4(V)} \\times 0{,}7 ${e4(m)} ${N4(m)}${U('kg')}`} />
          </>
        }
        show={show}
      />
    );
    readout = [
      { label: 'Xăng đã dùng', value: `${f4(V)} L`, tone: 'time' as const },
      { label: 'Khối lượng xăng', value: `${f4(m)} kg`, tone: 'a' as const },
      { label: 'CO₂ thải ra', value: show ? `${f4(emit)} kg` : '? kg', tone: 'b' as const },
    ];
  } else if (q.mode === 'than') {
    unit = 'tấn';
    const res = computeMass(q.coal, q.pctC, C, [CO2_1], 100);
    emit = res.items[0].value;
    problem = (
      <p>
        Một nhà máy nhiệt điện đốt <Num tone="a">{fmt(q.coal)} tấn</Num> than chứa <Num tone="t">{q.pctC}%</Num> carbon (cháy
        hoàn toàn). Tính khối lượng khí CO₂ thải vào khí quyển.
      </p>
    );
    solution = (
      <MassSolution raw="than" mRaw={q.coal} pct={q.pctC} A={C} targets={[CO2_1]} H={100} unitName="tấn"
        equation={'\\mathrm{C} + \\mathrm{O_2} \\xrightarrow{t^\\circ} \\mathrm{CO_2}'} show={show} />
    );
    readout = [
      { label: 'Than', value: `${fmt(q.coal)} tấn`, tone: 'time' as const },
      { label: 'Carbon', value: `${f4(res.mA)} tấn`, tone: 'a' as const },
      { label: 'CO₂ thải ra', value: show ? `${f4(emit)} tấn` : '? tấn', tone: 'b' as const },
    ];
  } else {
    const trees = q.co2 / q.absorb;
    const need = Math.ceil(trees - 1e-9);
    problem = (
      <p>
        Một gia đình mỗi năm thải ra khoảng <Num tone="a">{fmtG(q.co2)} kg</Num> khí CO₂ do dùng xe máy và điện. Một cây xanh
        trưởng thành hấp thụ khoảng <Num tone="t">{q.absorb} kg</Num> CO₂ mỗi năm. Cần trồng ít nhất bao nhiêu cây để hấp thụ
        hết lượng CO₂ đó?
      </p>
    );
    solution = (
      <>
        <Summary given={[`m_{\\mathrm{CO_2}} = ${N(q.co2)}${u('kg')};\\ ${q.absorb}${u('kg mỗi cây mỗi năm')}`]} find={['\\text{số cây}']} />
        <Step>Số cây xanh cần trồng:</Step>
        <Calc tex={`${N(q.co2)} \\chia ${q.absorb} ${e4(trees)} ${B(show, N4(trees))}${U('cây')}`} />
        {need !== trees && <Step>{show ? `Số cây phải là số tự nhiên nên cần ít nhất ${need} cây.` : <span className="blank">?</span>}</Step>}
        <Answer show={show} items={[`${need} cây`]} />
      </>
    );
    emit = q.co2;
    readout = [
      { label: 'CO₂ mỗi năm', value: `${fmtG(q.co2)} kg`, tone: 'time' as const },
      { label: 'Một cây hấp thụ', value: `${q.absorb} kg`, tone: 'a' as const },
      { label: 'Số cây cần trồng', value: show ? `${need} cây` : '?', tone: 'b' as const },
    ];
  }

  const draw = (p: p5) =>
    drawCarbon(p, {
      mode: q.mode,
      emitText: show ? `${fmtG(emit, 2)} ${unit} CO₂` : `? ${unit} CO₂`,
      absorbText: `${fmtG(q.co2)} kg CO₂`,
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  return (
    <LessonLayout
      slug="nhien-lieu-hoa-thach"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Chu trình carbon: đốt nhiên liệu thải CO₂ vào khí quyển, cây xanh và đại dương hấp thụ lại; nhiệt kế cho biết Trái Đất ấm lên."
      readout={readout}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />}
      fields={
        <>
          <RangeField id="km" label="Quãng đường" tone="a" min={10} max={3000} step={10}
            value={q.km} display={`${fmtG(q.km)} km`} onChange={(v) => ex.edit({ km: v })} hidden={q.mode !== 'xang'} />
          <RangeField id="cons" label="Xăng cho 100 km" tone="t" min={1} max={10} step={0.5}
            value={q.cons} display={`${fmt(q.cons)} L`} onChange={(v) => ex.edit({ cons: v })} hidden={q.mode !== 'xang'} />
          <RangeField id="coal" label="Khối lượng than" tone="a" min={0.5} max={200} step={0.5}
            value={q.coal} display={`${fmt(q.coal)} tấn`} onChange={(v) => ex.edit({ coal: v })} hidden={q.mode !== 'than'} />
          <RangeField id="pctC" label="Hàm lượng carbon" tone="t" min={50} max={95} step={1}
            value={q.pctC} display={`${q.pctC}%`} onChange={(v) => ex.edit({ pctC: v })} hidden={q.mode !== 'than'} />
          <RangeField id="co2" label="CO₂ thải ra mỗi năm" tone="a" min={100} max={5000} step={50}
            value={q.co2} display={`${fmtG(q.co2)} kg`} onChange={(v) => ex.edit({ co2: v })} hidden={q.mode !== 'cay'} />
          <RangeField id="absorb" label="CO₂ một cây hấp thụ mỗi năm" tone="t" min={10} max={50} step={1}
            value={q.absorb} display={`${q.absorb} kg`} onChange={(v) => ex.edit({ absorb: v })} hidden={q.mode !== 'cay'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Nhiên liệu hóa thạch', text: 'than đá, dầu mỏ, khí thiên nhiên: hình thành từ xác sinh vật qua hàng triệu năm, không tái tạo' },
        { term: 'Chu trình carbon', text: 'carbon trao đổi giữa khí quyển, sinh vật, đại dương, đất đá' },
        { term: 'Ấm lên toàn cầu', text: 'khí nhà kính ($\\mathrm{CO_2}$, $\\mathrm{CH_4}$…) tăng giữ nhiệt, Trái Đất nóng lên' },
        { term: 'Giảm phát thải', text: 'tiết kiệm năng lượng, dùng năng lượng tái tạo, trồng rừng' },
      ]}
      playLabels={START_LABELS}
    />
  );
}
