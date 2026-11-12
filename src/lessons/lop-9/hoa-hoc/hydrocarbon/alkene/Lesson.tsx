'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import Molecule3D from '@/components/Molecule3D';
import { Num, RangeField, Segmented, REACT_LABELS } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import {
  VM, coefOf, combustion, cu, e4, eqTex, eqUni, mOf, massOf, molFromMass, molFromVolume, molRatio, molarMass, N4, VOf, volumeOf,
  type Reaction,
  f4,
} from '@/lib/chem';
import { fmt, isExact } from '@/lib/format';
import { B, N, T, U, eq, u } from '@/lib/tex';
import { drawReactionScene } from '@/lib/draw/reaction';
import type { Mol3DId } from '@/lib/molecules3d';
import { EXERCISES } from './exercises';
import { drawBromine, drawPolymer } from './sketch';

/** brom: cộng bromine; honhop: tách ethylene khỏi methane; dot: đốt cháy; trunghop: tạo polyethylene */
export type Mode = 'brom' | 'honhop' | 'dot' | 'trunghop';
export type AlkeneId = 'C2H4' | 'C3H6';

export interface Params {
  mode: Mode;
  mol: AlkeneId;
  n: number; // mol khí (alkene, hoặc cả hỗn hợp)
  pct: number; // % thể tích C2H4 trong hỗn hợp (ẩn, tạo khối lượng Br2)
  mass: number; // tấn ethylene đem trùng hợp
  H: number; // hiệu suất %
}

const NAMES: Record<AlkeneId, string> = { C2H4: 'ethylene', C3H6: 'propylene' };
const DIBROMO: Record<AlkeneId, string> = { C2H4: 'C2H4Br2', C3H6: 'C3H6Br2' };

const MODE_OPTIONS = [
  { value: 'brom', label: 'Cộng bromine' },
  { value: 'honhop', label: 'Hỗn hợp với methane' },
  { value: 'dot', label: 'Đốt cháy' },
  { value: 'trunghop', label: 'Trùng hợp' },
] as const;
const MOL_OPTIONS = (Object.keys(NAMES) as AlkeneId[]).map((k) => ({ value: k, label: cu(k) }));


/** Đổi sang dạng chỉ dùng ethylene thì chọn ethylene */
function fix(q: Params): Params {
  return (q.mode === 'honhop' || q.mode === 'trunghop') && q.mol !== 'C2H4' ? { ...q, mol: 'C2H4' } : q;
}

/** Phân tử 3D ứng với chất đang chọn */
const MOL3D_OF: Record<AlkeneId, Mol3DId> = { C2H4: 'ethylene', C3H6: 'propylene' };

export default function AlkeneLesson() {
  const ex = useExercises(EXERCISES, fix);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5, resetOn: ex.params });

  const show = sim.revealed;
  const e = (x: number) => eq(isExact(x, 4));
  const name = NAMES[q.mol];
  const addition: Reaction = { left: [{ f: q.mol, k: 1 }, { f: 'Br2', k: 1 }], right: [{ f: DIBROMO[q.mol], k: 1 }] };
  const V = q.n * VM;

  let problem;
  let solution;
  let draw: (p: p5) => void;
  let readout;

  if (q.mode === 'brom') {
    const mBr = q.n * 160;
    const prod = DIBROMO[q.mol];
    const mP = q.n * molarMass(prod);
    problem = (
      <p>
        Dẫn <Num tone="a">{f4(V)} L</Num> khí {name} ({cu(q.mol)}, đkc) vào dung dịch nước bromine dư. Viết
        phương trình hóa học, tính khối lượng bromine đã phản ứng và khối lượng sản phẩm tạo thành.
      </p>
    );
    solution = (
      <>
        <Summary given={[`${VOf(q.mol)} = ${N4(V)}${u('L')}`]} find={[mOf('Br2'), mOf(prod)]} />
        <Calc tex={molFromVolume(q.mol, V, q.n, true)} />
        <Step>Phương trình hóa học (phản ứng cộng):</Step>
        <Calc tex={eqTex(addition.left, addition.right)} />
        <Calc tex={molRatio('Br2', 1, q.mol, 1, q.n, true)} />
        <Calc tex={massOf('Br2', q.n, show, true)} />
        <Calc tex={massOf(prod, q.n, show, true)} />
        <Answer show={show} items={[`$${mOf('Br2')} ${e4(mBr)} ${N4(mBr)}${u('g')}$`, `$${mOf(prod)} ${e4(mP)} ${N4(mP)}${u('g')}$`]} />
      </>
    );
    draw = (p) =>
      drawBromine(p, {
        reaction: addition, equation: eqUni(addition.left, addition.right), mixture: false, fade: 0.6,
        gasLabel: `khí ${cu(q.mol)}`, t: sim.t, started: sim.started, done: sim.done,
      });
    readout = [
      { label: `Số mol ${cu(q.mol)}`, value: `${f4(q.n)} mol`, tone: 'time' as const },
      { label: 'Br₂ phản ứng', value: show ? `${f4(mBr)} g` : '? g', tone: 'a' as const },
      { label: cu(prod), value: show ? `${f4(mP)} g` : '? g', tone: 'b' as const },
    ];
  } else if (q.mode === 'honhop') {
    const nE = (q.n * q.pct) / 100;
    const mBr = nE * 160;
    const pE = q.pct;
    const pM = 100 - pE;
    problem = (
      <p>
        Dẫn <Num tone="a">{f4(V)} L</Num> hỗn hợp khí methane và ethylene (đkc) qua dung dịch nước bromine dư, thấy
        có <Num tone="b">{f4(mBr)} g</Num> bromine tham gia phản ứng. Tính phần trăm thể tích mỗi khí trong hỗn hợp.
      </p>
    );
    solution = (
      <>
        <Summary given={[`V_\\text{hỗn hợp} = ${N4(V)}${u('L')};\\ ${mOf('Br2')} = ${N4(mBr)}${u('g')}`]} find={['\\%V_{\\mathrm{C_2H_4}}', '\\%V_{\\mathrm{CH_4}}']} />
        <Step>Methane không phản ứng với nước bromine, chỉ ethylene phản ứng:</Step>
        <Calc tex={eqTex(addition.left, addition.right)} />
        <Calc tex={molFromMass('Br2', mBr, nE, show)} />
        <Calc tex={`${'n_{\\mathrm{C_2H_4}}'} = ${'n_{\\mathrm{Br_2}}'} = ${B(show, N4(nE))}\\;(${T('mol')});\\quad n_\\text{hỗn hợp} = ${N4(V)} \\chia 24{,}79 = ${N4(q.n)}\\;(${T('mol')})`} />
        <Step>Ở cùng điều kiện, tỉ lệ thể tích bằng tỉ lệ số mol:</Step>
        <Calc tex={`\\%V_{\\mathrm{C_2H_4}} = ${B(show, N4(nE))} \\times 100 \\chia ${N4(q.n)} ${e(pE)} ${B(show, N4(pE))}\\%`} />
        <Calc tex={`\\%V_{\\mathrm{CH_4}} = 100\\% - ${B(show, N4(pE))}\\% = ${B(show, N4(pM))}\\%`} />
        <Answer show={show} items={[`$\\%V_{\\mathrm{C_2H_4}} = ${N4(pE)}\\%$`, `$\\%V_{\\mathrm{CH_4}} = ${N4(pM)}\\%$`]} />
      </>
    );
    draw = (p) =>
      drawBromine(p, {
        reaction: addition, equation: eqUni(addition.left, addition.right), mixture: true, fade: 0.45,
        gasLabel: 'CH₄ + C₂H₄', t: sim.t, started: sim.started, done: sim.done,
      });
    readout = [
      { label: 'Br₂ phản ứng', value: `${f4(mBr)} g`, tone: 'time' as const },
      { label: '% thể tích C₂H₄', value: show ? `${f4(pE)}%` : '?', tone: 'a' as const },
      { label: '% thể tích CH₄', value: show ? `${f4(pM)}%` : '?', tone: 'b' as const },
    ];
  } else if (q.mode === 'dot') {
    const r = combustion(q.mol);
    const kA = coefOf(r, q.mol);
    const m = q.n * molarMass(q.mol);
    const nOf = (f: string) => (q.n * coefOf(r, f)) / kA;
    const targets: { f: string; kind: 'V' | 'm' }[] = [{ f: 'O2', kind: 'V' }, { f: 'CO2', kind: 'V' }, { f: 'H2O', kind: 'm' }];
    const valueOf = (t: { f: string; kind: 'V' | 'm' }) => (t.kind === 'V' ? nOf(t.f) * VM : nOf(t.f) * molarMass(t.f));
    const symOf = (t: { f: string; kind: 'V' | 'm' }) => (t.kind === 'V' ? VOf(t.f) : mOf(t.f));
    problem = (
      <p>
        Đốt cháy hoàn toàn <Num tone="a">{f4(m)} g</Num> khí {name} ({cu(q.mol)}). Tính thể tích khí oxygen cần dùng,
        thể tích khí carbon dioxide (đkc) và khối lượng nước tạo thành.
      </p>
    );
    solution = (
      <>
        <Summary given={[`${mOf(q.mol)} = ${N4(m)}${u('g')}`]} find={targets.map(symOf)} />
        <Calc tex={molFromMass(q.mol, m, q.n, true)} />
        <Step>Phương trình hóa học:</Step>
        <Calc tex={eqTex(r.left, r.right, 't^\\circ')} />
        {targets.map((t) => <Calc key={t.f} tex={molRatio(t.f, coefOf(r, t.f), q.mol, kA, q.n, show, true)} />)}
        {targets.map((t) => (
          <Calc key={`v${t.f}`} tex={t.kind === 'V' ? volumeOf(t.f, nOf(t.f), show) : massOf(t.f, nOf(t.f), show)} />
        ))}
        <Answer show={show} items={targets.map((t) => `$${symOf(t)} ${e4(valueOf(t))} ${N4(valueOf(t))}${u(t.kind === 'V' ? 'L' : 'g')}$`)} />
      </>
    );
    const all = [...r.left, ...r.right];
    const maxN = Math.max(...all.map((s) => nOf(s.f)));
    draw = (p) =>
      drawReactionScene(p, {
        reaction: r,
        equation: eqUni(r.left, r.right, 't°'),
        bars: all.map((s) => ({
          label: cu(s.f), reactant: r.left.includes(s), frac: nOf(s.f) / maxN,
          text: s.f === q.mol || show ? `${f4(nOf(s.f))} mol` : '? mol',
        })),
        captions: [`Đốt cháy ${name} trong oxygen`, 'Alkene cháy tạo carbon dioxide và nước, tỏa nhiều nhiệt', 'Sản phẩm cháy: CO₂ và H₂O'],
        t: sim.t, started: sim.started, done: sim.done,
      });
    readout = [
      { label: `Số mol ${cu(q.mol)}`, value: `${f4(q.n)} mol`, tone: 'time' as const },
      { label: 'Thể tích O₂', value: show ? `${f4(valueOf(targets[0]))} L` : '? L', tone: 'a' as const },
      { label: 'Khối lượng H₂O', value: show ? `${f4(valueOf(targets[2]))} g` : '? g', tone: 'b' as const },
    ];
  } else {
    const theory = q.mass;
    const pe = (theory * q.H) / 100;
    problem = (
      <p>
        Trùng hợp <Num tone="a">{fmt(q.mass)} tấn</Num> ethylene để sản xuất polyethylene (PE). Tính khối lượng PE thu
        được, biết hiệu suất phản ứng là <Num tone="b">{fmt(q.H)}%</Num>.
      </p>
    );
    solution = (
      <>
        <Summary given={[`m_\\text{ethylene} = ${N(q.mass)}${u('tấn')};\\ H = ${N(q.H)}\\%`]} find={[T('m PE')]} />
        <Step>Phương trình hóa học:</Step>
        <Calc tex={`n\\,\\mathrm{CH_2{=}CH_2} \\xrightarrow{t^\\circ,\\ p,\\ \\text{xt}} (-\\mathrm{CH_2{-}CH_2}-)_n`} />
        <Step>Theo định luật bảo toàn khối lượng, khối lượng PE theo lí thuyết bằng khối lượng ethylene:</Step>
        <Calc tex={`m_\\text{PE (lí thuyết)} = ${N(theory)}${U('tấn')}`} />
        <Step>Với hiệu suất {fmt(q.H)}%:</Step>
        <Calc tex={`m_\\text{PE} = ${N(theory)} \\times ${N(q.H)} \\chia 100 ${e(pe)} ${B(show, N4(pe))}${U('tấn')}`} />
        <Answer show={show} items={[`$m_\\text{PE} ${e4(pe)} ${N4(pe)}${u('tấn')}$`]} />
      </>
    );
    draw = (p) =>
      drawPolymer(p, {
        t: sim.t, started: sim.started, done: sim.done, massText: `${fmt(q.mass)} tấn`, productText: show ? `${f4(pe)} tấn` : '? tấn',
      });
    readout = [
      { label: 'Ethylene', value: `${fmt(q.mass)} tấn`, tone: 'time' as const },
      { label: 'Hiệu suất', value: `${fmt(q.H)}%`, tone: 'a' as const },
      { label: 'PE thu được', value: show ? `${f4(pe)} tấn` : '? tấn', tone: 'b' as const },
    ];
  }

  const gasModes = q.mode === 'brom' || q.mode === 'dot';
  return (
    <LessonLayout
      slug="alkene"
      sim={sim}
      exercises={ex}
      media={<Molecule3D files={['ethylene', 'propylene']} value={MOL3D_OF[q.mol]} groups={[{ label: 'liên kết đơn – đôi – ba', files: ['ethane', 'ethylene', 'acetylene'] }]} />}
      problem={problem}
      draw={draw}
      canvasLabel={
        q.mode === 'trunghop'
          ? 'Các phân tử ethylene nối với nhau thành mạch polyethylene.'
          : q.mode === 'dot'
            ? 'Phương trình đốt cháy bằng mô hình phân tử và số mol từng chất.'
            : 'Khí được dẫn vào ống nghiệm đựng nước bromine, màu da cam nhạt dần; phía trên là phản ứng cộng bằng mô hình phân tử.'
      }
      readout={readout}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />
          {gasModes && <Segmented name="mol" legend="Alkene" options={MOL_OPTIONS} value={q.mol} onChange={(v) => ex.edit({ mol: v })} />}
        </>
      }
      fields={
        <>
          <RangeField id="n" label={q.mode === 'honhop' ? 'Thể tích hỗn hợp' : `Lượng ${cu(q.mol)}`} tone="a" min={0.05} max={2} step={0.05}
            value={q.n} display={q.mode === 'dot' ? `${f4(q.n * molarMass(q.mol))} g` : `${f4(V)} L`}
            onChange={(x) => ex.edit({ n: x })} hidden={q.mode === 'trunghop'} />
          <RangeField id="pct" label="Khối lượng Br₂ (theo % C₂H₄)" tone="b" min={5} max={95} step={5}
            value={q.pct} display={`${f4((q.n * q.pct * 160) / 100)} g`} onChange={(x) => ex.edit({ pct: x })} hidden={q.mode !== 'honhop'} />
          <RangeField id="mass" label="Khối lượng ethylene" tone="a" min={0.5} max={20} step={0.5}
            value={q.mass} display={`${fmt(q.mass)} tấn`} onChange={(x) => ex.edit({ mass: x })} hidden={q.mode !== 'trunghop'} />
          <RangeField id="H" label="Hiệu suất" tone="b" min={50} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => ex.edit({ H: x })} hidden={q.mode !== 'trunghop'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Alkene', text: 'hydrocarbon mạch hở có một liên kết đôi, công thức chung $\\mathrm{C_nH_{2n}}$ ($n \\ge 2$)' },
        { term: 'Phản ứng cộng', text: '$\\mathrm{C_2H_4} + \\mathrm{Br_2} \\rightarrow \\mathrm{C_2H_4Br_2}$: làm mất màu nước bromine' },
        { term: 'Nhận biết', text: 'alkene làm mất màu nước bromine, alkane thì không' },
        { term: 'Trùng hợp', text: 'nhiều phân tử ethylene nối thành polyethylene (PE)' },
      ]}
      playLabels={REACT_LABELS}
    />
  );
}
