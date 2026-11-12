'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, START_LABELS } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { VM, ce, e4, eqTex, eqUni, mOf, molFromVolume, molRatio, massOf, N4, VOf, f4, type Reaction } from '@/lib/chem';
import { fmt, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawExtract } from './sketch';

/** locao: luyện gang; dienphan: điện phân Al2O3 nóng chảy; hopkim: thành phần đồng thau */
export type Mode = 'locao' | 'dienphan' | 'hopkim';

export interface Params {
  mode: Mode;
  ore: number; // tấn quặng (lò cao) hoặc tấn Al2O3 (điện phân)
  pct: number; // % Fe2O3 trong quặng
  H: number; // hiệu suất %
  alloy: number; // g đồng thau
  zn: number; // % Zn trong đồng thau (ẩn, dùng tạo thể tích H2)
}

const MODE_OPTIONS = [
  { value: 'locao', label: 'Luyện gang (lò cao)' },
  { value: 'dienphan', label: 'Điện phân nhôm oxide' },
  { value: 'hopkim', label: 'Thành phần hợp kim' },
] as const;

const FURNACE: Reaction = { left: [{ f: 'Fe2O3', k: 1 }, { f: 'CO', k: 3 }], right: [{ f: 'Fe', k: 2 }, { f: 'CO2', k: 3 }] };
const ELECTRO: Reaction = { left: [{ f: 'Al2O3', k: 2 }], right: [{ f: 'Al', k: 4 }, { f: 'O2', k: 3 }] };
const BRASS: Reaction = { left: [{ f: 'Zn', k: 1 }, { f: 'HCl', k: 2 }], right: [{ f: 'ZnCl2', k: 1 }, { f: 'H2', k: 1 }] };


const tex4 = (x: number) => N(x, 4);

export default function TachKimLoaiLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 6, resetOn: ex.params });

  const show = sim.revealed;
  const e = (x: number) => eq(isExact(x, 4));

  // Lò cao: 160 tấn Fe2O3 → 112 tấn Fe
  const mOx = (q.ore * q.pct) / 100;
  const feTheory = (mOx * 112) / 160;
  const fe = (feTheory * q.H) / 100;
  // Điện phân: 204 tấn Al2O3 → 108 tấn Al
  const alTheory = (q.ore * 108) / 204;
  const al = (alTheory * q.H) / 100;
  // Hợp kim
  const mZn = (q.alloy * q.zn) / 100;
  const nH2 = mZn / 65;
  const V = nH2 * VM;
  const pZn = q.zn;
  const pCu = 100 - pZn;

  let problem;
  let solution;
  let draw: (p: p5) => void;
  let readout;
  if (q.mode === 'locao') {
    problem = (
      <p>
        Dùng <Num tone="a">{fmt(q.ore)} tấn</Num> quặng hematite chứa <Num tone="t">{fmt(q.pct)}%</Num> Fe₂O₃ để luyện
        gang trong lò cao. Tính khối lượng sắt thu được, biết hiệu suất của quá trình là{' '}
        <Num tone="b">{fmt(q.H)}%</Num>.
      </p>
    );
    solution = (
      <>
        <Summary given={[`m_\\text{quặng} = ${N(q.ore)}${u('tấn')};\\ ${ce('Fe2O3')}\\ ${N(q.pct)}\\%;\\ H = ${N(q.H)}\\%`]} find={[mOf('Fe')]} />
        <Step>{'Khối lượng $\\mathrm{Fe_2O_3}$ có trong quặng:'}</Step>
        <Calc tex={`${mOf('Fe2O3')} = ${N(q.ore)} \\times ${N(q.pct)} \\chia 100 ${e(mOx)} ${B(show, tex4(mOx))}${U('tấn')}`} />
        <Step>Phương trình hóa học:</Step>
        <Calc tex={eqTex(FURNACE.left, FURNACE.right, 't^\\circ')} />
        <Step>{'Cứ 160 tấn $\\mathrm{Fe_2O_3}$ tạo ra $2 \\times 56 = 112$ tấn Fe, nên theo lí thuyết:'}</Step>
        <Calc tex={`${mOf('Fe')} = ${B(show, tex4(mOx))} \\times 112 \\chia 160 ${e(feTheory)} ${B(show, tex4(feTheory))}${U('tấn')}`} />
        <Step>Với hiệu suất {fmt(q.H)}%, khối lượng sắt thu được:</Step>
        <Calc tex={`${B(show, tex4(feTheory))} \\times ${N(q.H)} \\chia 100 ${e(fe)} ${B(show, tex4(fe))}${U('tấn')}`} />
        <Answer show={show} items={[`$${mOf('Fe')} ${e4(fe)} ${N4(fe)}${u('tấn')}$`]} />
      </>
    );
    draw = (p) =>
      drawExtract(p, {
        mode: q.mode, equation: eqUni(FURNACE.left, FURNACE.right, 't°'), inLabel: 'Fe₂O₃', outLabel: 'Fe',
        inText: `${f4(mOx)} tấn`, outText: show ? `${f4(fe)} tấn` : '? tấn', t: sim.t, started: sim.started, done: sim.done,
      });
    readout = [
      { label: 'Fe₂O₃ trong quặng', value: `${f4(mOx)} tấn`, tone: 'time' as const },
      { label: 'Fe theo lí thuyết', value: show ? `${f4(feTheory)} tấn` : '? tấn', tone: 'a' as const },
      { label: 'Fe thu được', value: show ? `${f4(fe)} tấn` : '? tấn', tone: 'b' as const },
    ];
  } else if (q.mode === 'dienphan') {
    problem = (
      <p>
        Điện phân nóng chảy <Num tone="a">{fmt(q.ore)} tấn</Num> aluminium oxide (Al₂O₃) có mặt cryolite. Tính khối
        lượng nhôm thu được, biết hiệu suất của quá trình là <Num tone="b">{fmt(q.H)}%</Num>.
      </p>
    );
    solution = (
      <>
        <Summary given={[`${mOf('Al2O3')} = ${N(q.ore)}${u('tấn')};\\ H = ${N(q.H)}\\%`]} find={[mOf('Al')]} />
        <Step>Phương trình hóa học:</Step>
        <Calc tex={eqTex(ELECTRO.left, ELECTRO.right, '\\text{đpnc}')} />
        <Step>{'Cứ $2 \\times 102 = 204$ tấn $\\mathrm{Al_2O_3}$ tạo ra $4 \\times 27 = 108$ tấn Al, nên theo lí thuyết:'}</Step>
        <Calc tex={`${mOf('Al')} = ${N(q.ore)} \\times 108 \\chia 204 ${e(alTheory)} ${B(show, tex4(alTheory))}${U('tấn')}`} />
        <Step>Với hiệu suất {fmt(q.H)}%, khối lượng nhôm thu được:</Step>
        <Calc tex={`${B(show, tex4(alTheory))} \\times ${N(q.H)} \\chia 100 ${e(al)} ${B(show, tex4(al))}${U('tấn')}`} />
        <Answer show={show} items={[`$${mOf('Al')} ${e4(al)} ${N4(al)}${u('tấn')}$`]} />
      </>
    );
    draw = (p) =>
      drawExtract(p, {
        mode: q.mode, equation: eqUni(ELECTRO.left, ELECTRO.right, 'đpnc'), inLabel: 'Al₂O₃', outLabel: 'Al',
        inText: `${f4(q.ore)} tấn`, outText: show ? `${f4(al)} tấn` : '? tấn', t: sim.t, started: sim.started, done: sim.done,
      });
    readout = [
      { label: 'Al₂O₃ đem điện phân', value: `${f4(q.ore)} tấn`, tone: 'time' as const },
      { label: 'Al theo lí thuyết', value: show ? `${f4(alTheory)} tấn` : '? tấn', tone: 'a' as const },
      { label: 'Al thu được', value: show ? `${f4(al)} tấn` : '? tấn', tone: 'b' as const },
    ];
  } else {
    problem = (
      <p>
        Cho <Num tone="a">{fmt(q.alloy)} g</Num> đồng thau (hợp kim Cu – Zn) vào dung dịch HCl dư, thu được{' '}
        <Num tone="t">{f4(V)} L</Num> khí H₂ (đkc). Tính phần trăm khối lượng mỗi kim loại trong hợp kim.
      </p>
    );
    solution = (
      <>
        <Summary given={[`m_\\text{hợp kim} = ${N(q.alloy)}${u('g')};\\ ${VOf('H2')} = ${N4(V)}${u('L')}`]} find={['\\%\\mathrm{Zn}', '\\%\\mathrm{Cu}']} />
        <Step>Cu đứng sau H trong dãy hoạt động nên không phản ứng; chỉ Zn phản ứng:</Step>
        <Calc tex={eqTex(BRASS.left, BRASS.right)} />
        <Calc tex={molFromVolume('H2', V, nH2, show)} />
        <Calc tex={molRatio('Zn', 1, 'H2', 1, nH2, show)} />
        <Calc tex={massOf('Zn', nH2, show)} />
        <Step>Phần trăm khối lượng mỗi kim loại:</Step>
        <Calc tex={`\\%\\mathrm{Zn} = ${B(show, N4(mZn))} \\times 100 \\chia ${N(q.alloy)} ${e(pZn)} ${B(show, N4(pZn))}\\%`} />
        <Calc tex={`\\%\\mathrm{Cu} = 100\\% - ${B(show, N4(pZn))}\\% = ${B(show, N4(pCu))}\\%`} />
        <Answer show={show} items={[`$\\%\\mathrm{Zn} = ${N4(pZn)}\\%$`, `$\\%\\mathrm{Cu} = ${N4(pCu)}\\%$`]} />
      </>
    );
    draw = (p) =>
      drawExtract(p, {
        mode: q.mode, equation: eqUni(BRASS.left, BRASS.right), inLabel: 'Zn', outLabel: 'H₂',
        inText: show ? `${f4(mZn)} g` : '? g', outText: `${f4(V)} L`, t: sim.t, started: sim.started, done: sim.done,
      });
    readout = [
      { label: 'Khí H₂ (đkc)', value: `${f4(V)} L`, tone: 'time' as const },
      { label: '% Zn', value: show ? `${f4(pZn)}%` : '?', tone: 'a' as const },
      { label: '% Cu', value: show ? `${f4(pCu)}%` : '?', tone: 'b' as const },
    ];
  }

  return (
    <LessonLayout
      slug="tach-kim-loai-hop-kim"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel={
        q.mode === 'locao'
          ? 'Lò cao: nguyên liệu nạp từ trên, không khí nóng thổi vào, gang lỏng tụ ở đáy lò.'
          : q.mode === 'dienphan'
            ? 'Bể điện phân: nhôm oxide nóng chảy, nhôm lỏng tụ ở đáy (cực âm), khí oxygen thoát ra ở cực dương.'
            : 'Mẩu đồng thau trong dung dịch HCl: kẽm tan tạo bọt khí hydrogen, đồng còn lại.'
      }
      readout={readout}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />}
      fields={
        <>
          <RangeField id="ore" label={q.mode === 'locao' ? 'Khối lượng quặng' : 'Khối lượng Al₂O₃'} tone="a" min={0.1} max={100} step={0.1}
            value={q.ore} display={`${fmt(q.ore)} tấn`} onChange={(x) => ex.edit({ ore: x })} hidden={q.mode === 'hopkim'} />
          <RangeField id="pct" label="Hàm lượng Fe₂O₃ trong quặng" tone="t" min={30} max={95} step={5}
            value={q.pct} display={`${q.pct}%`} onChange={(x) => ex.edit({ pct: x })} hidden={q.mode !== 'locao'} />
          <RangeField id="H" label="Hiệu suất" tone="b" min={50} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => ex.edit({ H: x })} hidden={q.mode === 'hopkim'} />
          <RangeField id="alloy" label="Khối lượng đồng thau" tone="a" min={5} max={50} step={1}
            value={q.alloy} display={`${q.alloy} g`} onChange={(x) => ex.edit({ alloy: x })} hidden={q.mode !== 'hopkim'} />
          <RangeField id="zn" label="Thể tích H₂ (theo % Zn)" tone="t" min={10} max={50} step={2.5}
            value={q.zn} display={`${f4(V)} L`} onChange={(x) => ex.edit({ zn: x })} hidden={q.mode !== 'hopkim'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Nhiệt luyện', text: `dùng CO, C, H₂ khử oxide kim loại ở nhiệt độ cao (Fe, Zn, Cu…)` },
        { term: 'Điện phân nóng chảy', text: 'tách kim loại hoạt động mạnh: Na, Mg, Al' },
        { term: 'Hợp kim', text: 'gang, thép (Fe – C), đồng thau (Cu – Zn), duralumin (Al – Cu…) bền và cứng hơn kim loại nguyên chất' },
        { term: 'Hiệu suất', text: 'lượng thực tế $=$ lượng lí thuyết $\\times H \\chia 100$' },
      ]}
      playLabels={START_LABELS}
    />
  );
}

