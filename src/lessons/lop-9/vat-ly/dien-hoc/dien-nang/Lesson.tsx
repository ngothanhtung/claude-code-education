'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, fmtG, isExact } from '@/lib/format';
import { B, N, U as Un, eq, u } from '@/lib/tex';
import { drawPower } from '@/lessons/lop-9/vat-ly/dien-hoc/cong-suat-dien/sketch';

export interface Params {
  device: string;
  P: number; // W
  hours: number; // giờ mỗi ngày
  days: number;
  price: number; // đồng mỗi kWh
}

const LABELS: PlayLabels = { start: 'Dùng điện', pause: 'Tạm dừng', resume: 'Dùng tiếp', again: 'Dùng lại' };

const PS = '\\mathscr{P}';

export default function DienNangLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: q.days, defaultDuration: 7 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const show = sim.revealed;
  const Pkw = q.P / 1000;
  const tTotal = q.hours * q.days;
  const A = Pkw * tTotal;
  const money = A * q.price;
  const e = (x: number) => eq(isExact(x));

  const draw = (p: p5) =>
    drawPower(p, {
      mode: 'diennang', U: 220, P: q.P, I: 0, hours: q.hours, days: q.days, t: sim.t, show, done: sim.done, device: q.device,
    });

  const problem = (
    <p>
      Một {q.device} có công suất <Num tone="a">{fmtG(q.P, 0)} W</Num>, mỗi ngày dùng{' '}
      <Num tone="t">{fmt(q.hours)} giờ</Num>. Tính điện năng tiêu thụ trong <Num tone="t">{q.days} ngày</Num> và số tiền
      điện phải trả, biết giá điện là <Num tone="b">{fmtG(q.price, 0)} đồng</Num> cho mỗi kWh.
    </p>
  );

  const solution = (
    <>
      <Summary
        given={[
          `${PS} = ${N(q.P)}${u('W')};\\ \\text{mỗi ngày dùng}\\ ${N(q.hours)}${u('giờ')};\\ ${q.days}${u('ngày')}`,
          `\\text{giá điện:}\\ ${N(q.price)}${u('đồng mỗi kWh')}`,
        ]}
        find={['A', '\\text{Tiền điện}']}
      />
      <Step>{`Đổi: $${PS} = ${N(q.P)}${u('W')} = ${N(Pkw)}${u('kW')}$`}</Step>
      <Step>Thời gian dùng điện trong {q.days} ngày:</Step>
      <Calc tex={`t = ${N(q.hours)} \\times ${q.days} = ${B(show, N(tTotal))}${Un('giờ')}`} />
      <Step>Điện năng tiêu thụ:</Step>
      <Calc tex={`A = ${PS} \\times t = ${N(Pkw)} \\times ${B(show, N(tTotal))} ${e(A)} ${B(show, N(A))}${Un('kWh')}`} />
      <Step>Số tiền điện phải trả:</Step>
      <Calc tex={`${B(show, N(A))} \\times ${N(q.price)} = ${B(show, N(money, 0))}${Un('đồng')}`} />
      <Answer show={show} items={[`$A = ${N(A)}${u('kWh')}$`, `$${N(money, 0)}${u('đồng')}$`]} />
    </>
  );

  return (
    <LessonLayout
      slug="dien-nang"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Dụng cụ điện hoạt động mỗi ngày; công tơ điện đếm số kWh tăng dần theo từng ngày."
      readout={[
        { label: 'Số ngày đã dùng', value: `${Math.floor(Math.min(sim.t, q.days) + 1e-9)} ngày`, tone: 'time' },
        { label: 'Công tơ chỉ', value: `${fmt(Pkw * q.hours * Math.min(sim.t, q.days), 1)} kWh`, tone: 'a' },
        { label: 'Điện năng cả kỳ', value: show ? `${fmt(A)} kWh` : '? kWh', tone: 'b' },
        { label: 'Tiền điện', value: show ? `${fmtG(money, 0)} đ` : '? đ' },
      ]}
      fields={
        <>
          <RangeField id="P" label="Công suất dụng cụ" tone="a" min={100} max={2500} step={100}
            value={q.P} display={`${fmtG(q.P, 0)} W`} onChange={(v) => update({ P: v })} />
          <RangeField id="hours" label="Thời gian dùng mỗi ngày" tone="t" min={0.5} max={12} step={0.5}
            value={q.hours} display={`${fmt(q.hours)} giờ`} onChange={(v) => update({ hours: v })} />
          <RangeField id="days" label="Số ngày" tone="t" min={1} max={31} step={1}
            value={q.days} display={`${q.days} ngày`} onChange={(v) => update({ days: v })} />
          <RangeField id="price" label="Giá điện mỗi kWh" tone="b" min={1500} max={3500} step={100}
            value={q.price} display={`${fmtG(q.price, 0)} đồng`} onChange={(v) => update({ price: v })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Điện năng', text: `$A = ${PS} \\times t$` },
        { term: 'Kilôoát giờ', text: '$1\\,\\text{kWh} = 3\\,600\\,000\\,\\text{J}$' },
        { term: 'Công tơ điện', text: 'mỗi số đếm của công tơ là $1\\,\\text{kWh}$ điện năng đã tiêu thụ' },
      ]}
      playLabels={LABELS}
    />
  );
}
