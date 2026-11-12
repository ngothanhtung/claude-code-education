'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step } from '@/components/Notebook';
import { B, N, U, UN, u } from '@/lib/tex';
import { useParams } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt } from '@/lib/format';
import { drawCircle } from './sketch';

type Mode = 'chuvi' | 'dientich';
type Given = 'r' | 'd';

interface Params {
  mode: Mode;
  given: Given;
  /** bán kính (cm); khi đề cho đường kính thì d = 2r */
  r: number;
}

const MODE_OPTIONS = [
  { value: 'chuvi', label: 'Chu vi' },
  { value: 'dientich', label: 'Diện tích' },
] as const;

const GIVEN_OPTIONS = [
  { value: 'r', label: 'Bán kính' },
  { value: 'd', label: 'Đường kính' },
] as const;

const LABELS: Record<Mode, PlayLabels> = {
  chuvi: playLabels('Lăn hình tròn', 'Lăn tiếp', 'Xem lại'),
  dientich: playLabels('Cắt hình tròn', 'Xếp tiếp', 'Xem lại'),
};

/** Làm tròn bỏ sai số dấu phẩy động (kết quả nhân với 3,14 có tối đa 4 chữ số thập phân) */
const clean = (x: number) => Math.round(x * 10000) / 10000;

export default function HinhTronLesson() {
  const { params, edit } = useParams<Params>({ mode: 'chuvi', given: 'd', r: 2.5 });
  const { mode, given, r } = params;
  const d = 2 * r;
  const C = clean(d * 3.14);
  const S = clean(r * r * 3.14);

  const sim = useSimulation({ total: mode === 'chuvi' ? 2 : 3, defaultDuration: 7, resetOn: params });

  const show = sim.revealed;
  const draw = (p: p5) => drawCircle(p, { mode, given, r, C, S, t: sim.t, done: sim.done });

  const givenText =
    given === 'r' ? (
      <>
        bán kính <Num tone="t">r = {fmt(r)} cm</Num>
      </>
    ) : (
      <>
        đường kính <Num tone="b">d = {fmt(d)} cm</Num>
      </>
    );
  const problem = (
    <p>
      Tính {mode === 'chuvi' ? 'chu vi' : 'diện tích'} hình tròn có {givenText}.
    </p>
  );

  let solution;
  if (mode === 'chuvi') {
    solution = (
      <>
        <Step>Chu vi hình tròn là:</Step>
        <Calc
          tex={`${given === 'd' ? `${N(d)} \\times 3{,}14` : `${N(r)} \\times 2 \\times 3{,}14`} = ${B(show, N(C, 4))}${U('cm')}`}
        />
        <Answer show={show} items={[`$${N(C, 4)}${u('cm')}$`]} />
      </>
    );
  } else {
    const rr = B(show || given === 'r', N(r));
    solution = (
      <>
        {given === 'd' && (
          <>
            <Step>Bán kính hình tròn là:</Step>
            <Calc tex={`${N(d)} \\chia 2 = ${B(show, N(r))}${U('cm')}`} />
          </>
        )}
        <Step>Diện tích hình tròn là:</Step>
        <Calc tex={`${rr} \\times ${rr} \\times 3{,}14 = ${B(show, N(S, 4))}\\;(${UN('cm²')})`} />
        <Answer show={show} items={[`$${N(S, 4)}\\,${UN('cm²')}$`]} />
      </>
    );
  }

  const activeRule = mode === 'dientich' ? 'dt' : given === 'd' ? 'cd' : 'cr';

  return (
    <LessonLayout
      slug="hinh-tron"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel={
        mode === 'chuvi'
          ? 'Hình tròn lăn một vòng trên đường thẳng; đoạn đã lăn bằng chu vi, dài hơn 3 lần đường kính một chút.'
          : 'Hình tròn được cắt thành 16 hình quạt và xếp xen kẽ thành gần một hình chữ nhật dài bằng nửa chu vi, rộng bằng bán kính.'
      }
      readout={[
        { label: 'Bán kính', value: `${fmt(r)} cm`, tone: 'time' },
        { label: 'Đường kính', value: `${fmt(d)} cm`, tone: 'b' },
        mode === 'chuvi'
          ? { label: 'Chu vi', value: show ? `${fmt(C, 4)} cm` : '? cm', tone: 'a' }
          : { label: 'Diện tích', value: show ? `${fmt(S, 4)} cm²` : '? cm²', tone: 'a' },
        { label: 'Số dùng để nhân', value: '3,14' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Cần tìm" options={MODE_OPTIONS} value={mode} onChange={(m) => edit({ mode: m })} />
          <Segmented name="given" legend="Đề cho" options={GIVEN_OPTIONS} value={given} onChange={(g) => edit({ given: g })} />
        </>
      }
      fields={
        given === 'r' ? (
          <RangeField id="sR" label="Bán kính" tone="t" min={1} max={10} step={0.5}
            value={r} display={`${fmt(r)} cm`} onChange={(v) => edit({ r: v })} />
        ) : (
          <RangeField id="sD" label="Đường kính" tone="b" min={2} max={20} step={1}
            value={d} display={`${fmt(d)} cm`} onChange={(v) => edit({ r: v / 2 })} />
        )
      }
      solution={solution}
      rules={[
        { key: 'cd', term: 'Chu vi hình tròn', text: 'đường kính × 3,14, $C = d \\times 3{,}14$' },
        { key: 'cr', term: 'Chu vi hình tròn', text: 'bán kính × 2 × 3,14, $C = r \\times 2 \\times 3{,}14$' },
        { key: 'dt', term: 'Diện tích hình tròn', text: 'bán kính × bán kính × 3,14, $S = r \\times r \\times 3{,}14$' },
      ]}
      activeRule={activeRule}
      playLabels={LABELS[mode]}
    />
  );
}
