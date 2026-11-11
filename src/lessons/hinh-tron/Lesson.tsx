'use client';

import { useState } from 'react';
import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/controls';
import { Answer, Calc, Step, Val } from '@/components/notebook';
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
  chuvi: { start: 'Lăn hình tròn', pause: 'Tạm dừng', resume: 'Lăn tiếp', again: 'Xem lại' },
  dientich: { start: 'Cắt hình tròn', pause: 'Tạm dừng', resume: 'Xếp tiếp', again: 'Xem lại' },
};

/** Làm tròn bỏ sai số dấu phẩy động (kết quả nhân với 3,14 có tối đa 4 chữ số thập phân) */
const clean = (x: number) => Math.round(x * 10000) / 10000;

export default function HinhTronLesson() {
  const [params, setParams] = useState<Params>({ mode: 'chuvi', given: 'd', r: 2.5 });
  const { mode, given, r } = params;
  const d = 2 * r;
  const C = clean(d * 3.14);
  const S = clean(r * r * 3.14);

  const sim = useSimulation({ total: mode === 'chuvi' ? 2 : 3, defaultDuration: 7 });
  const update = (patch: Partial<Params>) => {
    setParams((prev) => ({ ...prev, ...patch }));
    sim.reset();
  };

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
        <Calc>
          {given === 'd' ? `${fmt(d)} × 3,14` : `${fmt(r)} × 2 × 3,14`} = <Val show={show}>{fmt(C, 4)}</Val> (cm)
        </Calc>
        <Answer show={show} items={[`${fmt(C, 4)} cm`]} />
      </>
    );
  } else {
    solution = (
      <>
        {given === 'd' && (
          <>
            <Step>Bán kính hình tròn là:</Step>
            <Calc>
              {fmt(d)} : 2 = <Val show={show}>{fmt(r)}</Val> (cm)
            </Calc>
          </>
        )}
        <Step>Diện tích hình tròn là:</Step>
        <Calc>
          <Val show={show || given === 'r'}>{fmt(r)}</Val> × <Val show={show || given === 'r'}>{fmt(r)}</Val> × 3,14 ={' '}
          <Val show={show}>{fmt(S, 4)}</Val> (cm²)
        </Calc>
        <Answer show={show} items={[`${fmt(S, 4)} cm²`]} />
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
          <Segmented name="mode" legend="Cần tính" options={MODE_OPTIONS} value={mode} onChange={(m) => update({ mode: m })} />
          <Segmented name="given" legend="Đề cho" options={GIVEN_OPTIONS} value={given} onChange={(g) => update({ given: g })} />
        </>
      }
      fields={
        given === 'r' ? (
          <RangeField id="sR" label="Bán kính" tone="t" min={1} max={10} step={0.5}
            value={r} display={`${fmt(r)} cm`} onChange={(v) => update({ r: v })} />
        ) : (
          <RangeField id="sD" label="Đường kính" tone="b" min={2} max={20} step={1}
            value={d} display={`${fmt(d)} cm`} onChange={(v) => update({ r: v / 2 })} />
        )
      }
      solution={solution}
      rules={[
        { key: 'cd', term: 'Chu vi hình tròn', text: 'đường kính × 3,14' },
        { key: 'cr', term: 'Chu vi hình tròn', text: 'bán kính × 2 × 3,14' },
        { key: 'dt', term: 'Diện tích hình tròn', text: 'bán kính × bán kính × 3,14' },
      ]}
      activeRule={activeRule}
      playLabels={LABELS[mode]}
    />
  );
}
