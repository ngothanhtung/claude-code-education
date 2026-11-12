'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import {
  METALS, VM, ce, coefOf, combine, compound, cu, displacement, e4, eqTex, eqUni, mOf, massOf, molFromMass, molRatio, molarMass, N4, VOf, volumeOf,
  type Reaction,
  f4,
} from '@/lib/chem';
import { fmt } from '@/lib/format';
import { N, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawMetal } from './sketch';

/** oxi: cháy trong oxygen; clo: cháy trong chlorine; acid: tác dụng với dung dịch acid */
export type Mode = 'oxi' | 'clo' | 'acid';

export interface Params {
  mode: Mode;
  metal: string;
  acid: 'HCl' | 'H2SO4';
  m: number; // g kim loại
}

const MODE_OPTIONS = [
  { value: 'oxi', label: 'Tác dụng với oxygen' },
  { value: 'clo', label: 'Tác dụng với chlorine' },
  { value: 'acid', label: 'Tác dụng với acid' },
] as const;

const METALS_OF: Record<Mode, string[]> = {
  oxi: ['Mg', 'Al', 'Zn', 'Fe', 'Cu'],
  clo: ['Na', 'Mg', 'Al', 'Fe', 'Cu'],
  acid: ['Mg', 'Al', 'Zn', 'Fe'],
};

const ACID_OPTIONS = [
  { value: 'HCl', label: 'HCl' },
  { value: 'H2SO4', label: 'H₂SO₄ loãng' },
] as const;

const METAL_COL: Record<string, string> = { Na: '#E6E2D3', Mg: '#D9DDE5', Al: '#C9CED8', Zn: '#B8C0CC', Fe: '#7A808C', Cu: '#C8733A' };
const GLOW: Record<string, string> = { Na: '#FFD54A', Mg: '#FFFFFF', Al: '#FFFFFF', Zn: '#DDEBFF', Fe: '#FFB347', Cu: '#FF8A5B' };
const PRODUCT_COL: Record<string, string> = {
  MgO: '#EDEDED', Al2O3: '#EDEDED', ZnO: '#EEEEE6', Fe3O4: '#2B2B2B', CuO: '#1F1F1F',
  NaCl: '#EDEDED', MgCl2: '#EDEDED', AlCl3: '#EAEAE2', FeCl3: '#8B3A1A', CuCl2: '#8C6A2A',
};

/** Phản ứng của bài: sản phẩm chính (muối/oxide) và khí (O2, Cl2 phản ứng hoặc H2 sinh ra) */
function reactionOf(q: Params): { r: Reaction; product: string; gas: string } {
  if (q.mode === 'acid') {
    const r = displacement(q.metal, 'H', 1, q.acid === 'HCl' ? 'Cl' : 'SO4');
    return { r, product: r.right[0].f, gas: 'H2' };
  }
  if (q.mode === 'oxi') {
    const product = q.metal === 'Fe' ? 'Fe3O4' : compound(q.metal, METALS[q.metal].valence, 'O');
    return { r: combine(q.metal, 'O2', product), product, gas: 'O2' };
  }
  const product = compound(q.metal, q.metal === 'Fe' ? 3 : METALS[q.metal].valence, 'Cl');
  return { r: combine(q.metal, 'Cl2', product), product, gas: 'Cl2' };
}

/** Đổi dạng đề thì chọn kim loại hợp lệ */
function fix(q: Params): Params {
  return METALS_OF[q.mode].includes(q.metal) ? q : { ...q, metal: METALS_OF[q.mode][0] };
}

const LABELS = playLabels('Cho phản ứng', 'Tiếp tục', 'Làm lại thí nghiệm');

export default function TinhChatKimLoaiLesson() {
  const ex = useExercises(EXERCISES, fix);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 6, resetOn: ex.params });

  const show = sim.revealed;
  const { r, product, gas } = reactionOf(q);
  const kM = coefOf(r, q.metal);
  const kP = coefOf(r, product);
  const kG = coefOf(r, gas);
  const nM = q.m / molarMass(q.metal);
  const nP = (nM * kP) / kM;
  const nG = (nM * kG) / kM;
  const mP = nP * molarMass(product);
  const V = nG * VM;
  const metalName = METALS[q.metal].name;
  const cond = q.mode === 'acid' ? undefined : 't^\\circ';
  const gasRole = q.mode === 'acid' ? 'sinh ra' : 'đã phản ứng';

  const draw = (p: p5) =>
    drawMetal(p, {
      mode: q.mode,
      metal: q.metal,
      metalCol: METAL_COL[q.metal],
      glowCol: GLOW[q.metal],
      productCol: PRODUCT_COL[product] ?? '#EDEDED',
      equation: eqUni(r.left, r.right, cond ? 't°' : undefined),
      productLabel: cu(product),
      gasLabel: cu(gas),
      metalText: `${f4(nM)} mol`,
      productText: show ? `${f4(nP)} mol` : '? mol',
      gasText: show ? `${f4(nG)} mol` : '? mol',
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const reagent = q.mode === 'oxi' ? 'khí oxygen' : q.mode === 'clo' ? 'khí chlorine' : `dung dịch ${cu(q.acid)} loãng, dư`;
  const problem = (
    <p>
      {q.mode === 'acid' ? 'Cho' : 'Đốt cháy hoàn toàn'} <Num tone="a">{fmt(q.m)} g</Num> {metalName} ({q.metal}){' '}
      {q.mode === 'acid' ? 'vào' : 'trong'} <Num tone="t">{reagent}</Num>. Viết phương trình hóa học, tính khối lượng{' '}
      {cu(product)} tạo thành và thể tích khí {cu(gas)} {gasRole} (ở điều kiện chuẩn).
    </p>
  );

  const solution = (
    <>
      <Summary given={[`${mOf(q.metal)} = ${N(q.m)}${u('g')}`]} find={[mOf(product), VOf(gas)]} />
      <Step>{`Số mol ${q.metal}:`}</Step>
      <Calc tex={molFromMass(q.metal, q.m, nM, true)} />
      <Step>Phương trình hóa học:</Step>
      <Calc tex={eqTex(r.left, r.right, cond)} />
      <Step>Theo phương trình hóa học:</Step>
      <Calc tex={molRatio(product, kP, q.metal, kM, nM, show, true)} />
      <Calc tex={molRatio(gas, kG, q.metal, kM, nM, show, true)} />
      <Step>{`Khối lượng $${ce(product)}$ tạo thành:`}</Step>
      <Calc tex={massOf(product, nP, show)} />
      <Step>{`Thể tích khí $${ce(gas)}$ ${gasRole} (đkc):`}</Step>
      <Calc tex={volumeOf(gas, nG, show)} />
      <Answer show={show} items={[`$${mOf(product)} ${e4(mP)} ${N4(mP)}${u('g')}$`, `$${VOf(gas)} ${e4(V)} ${N4(V)}${u('L')}$`]} />
    </>
  );

  return (
    <LessonLayout
      slug="tinh-chat-kim-loai"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel={
        q.mode === 'acid'
          ? 'Kim loại tan trong dung dịch acid, khí hydrogen được dẫn sang ống nghiệm úp ngược trong chậu nước.'
          : 'Muỗng đốt đưa kim loại nóng đỏ vào bình khí; kim loại cháy tạo sản phẩm phủ đáy bình.'
      }
      readout={[
        { label: `Số mol ${q.metal}`, value: `${f4(nM)} mol`, tone: 'time' },
        { label: `Khối lượng ${cu(product)}`, value: show ? `${f4(mP)} g` : '? g', tone: 'a' },
        { label: `Thể tích ${cu(gas)}`, value: show ? `${f4(V)} L` : '? L', tone: 'b' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />
          <Segmented name="metal" legend="Kim loại" options={METALS_OF[q.mode].map((x) => ({ value: x, label: x }))}
            value={q.metal} onChange={(v) => ex.edit({ metal: v })} />
          {q.mode === 'acid' && (
            <Segmented name="acid" legend="Dung dịch acid" options={ACID_OPTIONS} value={q.acid} onChange={(v) => ex.edit({ acid: v })} />
          )}
        </>
      }
      fields={
        <RangeField id="m" label={`Khối lượng ${q.metal}`} tone="a" min={0.1} max={30} step={0.1}
          value={q.m} display={`${fmt(q.m)} g`} onChange={(x) => ex.edit({ m: x })} />
      }
      solution={solution}
      rules={[
        { term: 'Kim loại + oxygen', text: 'oxide base, ví dụ $2\\mathrm{Mg} + \\mathrm{O_2} \\xrightarrow{t^\\circ} 2\\mathrm{MgO}$' },
        { term: 'Kim loại + chlorine', text: 'muối chloride, ví dụ $2\\mathrm{Fe} + 3\\mathrm{Cl_2} \\xrightarrow{t^\\circ} 2\\mathrm{FeCl_3}$' },
        { term: 'Kim loại + acid', text: 'muối + khí hydrogen (kim loại đứng trước H trong dãy hoạt động)' },
        { term: 'Công thức', text: '$n = m \\chia M$; $V = n \\times 24{,}79$ (L, đkc)' },
      ]}
      playLabels={LABELS}
    />
  );
}
