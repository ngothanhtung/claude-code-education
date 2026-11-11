'use client';

import { useState } from 'react';
import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField } from '@/components/controls';
import { Answer, Calc, MinutesLine, Step, Val } from '@/components/notebook';
import { useSimulation } from '@/hooks/useSimulation';
import { clockStr, fmt, hm } from '@/lib/format';
import { driveMinutes, drawGioDen, isResting, posKm } from './sketch';

interface Params {
  dep: number; // phút từ 0 giờ
  S: number;
  V: number;
  rest: number; // phút
}

/**
 * Quãng đường được "bắt" theo bội số của v/4 (km) để thời gian đi luôn là
 * bội số của 15 phút – số đẹp như trong SGK.
 */
function snapDistance(raw: number, V: number) {
  const unit = V / 4;
  const lo = Math.ceil(20 / unit) * unit;
  const hi = Math.floor(240 / unit) * unit;
  return Math.min(hi, Math.max(lo, Math.round(raw / unit) * unit));
}

export default function GioDenLesson() {
  const [params, setParams] = useState<Params>({ dep: 450, S: 120, V: 48, rest: 15 });
  const { dep, S, V, rest } = params;
  const total = driveMinutes(S, V) + rest; // phút
  const sim = useSimulation({ total, defaultDuration: 10 });
  const update = (patch: Partial<Params>) => {
    setParams((prev) => {
      const next = { ...prev, ...patch };
      return { ...next, S: snapDistance(next.S, next.V) };
    });
    sim.reset();
  };

  const m = sim.t;
  const show = sim.revealed;
  const T = S / V; // giờ đi trên đường, luôn là bội số của 0,25
  const arrival = dep + total;

  let status = 'Chưa khởi hành';
  if (sim.done) status = 'Đã đến B';
  else if (isResting(params, m)) status = 'Đang nghỉ';
  else if (m > 0) status = 'Đang chạy';

  const draw = (p: p5) =>
    drawGioDen(p, { ...params, m, done: sim.done, doneAt: sim.doneAt, revealed: show });

  const problem = (
    <p>
      Một ô tô khởi hành từ A lúc <Num tone="t">{clockStr(dep)}</Num> và đi đến B với vận tốc{' '}
      <Num tone="a">{V} km/giờ</Num>. Quãng đường AB dài <Num tone="t">{fmt(S)} km</Num>.
      {rest > 0 && (
        <>
          {' '}Dọc đường ô tô nghỉ <Num tone="t">{rest} phút</Num>.
        </>
      )}{' '}
      Hỏi ô tô đến B lúc mấy giờ?
    </p>
  );

  const solution = (
    <>
      <Step>Thời gian ô tô đi trên đường là:</Step>
      <Calc>
        {fmt(S)} : {V} = <Val show={show}>{fmt(T)}</Val> (giờ)
      </Calc>
      <MinutesLine hours={T} show={show} />
      {rest > 0 && (
        <>
          <Step>Thời gian ô tô đi và nghỉ là:</Step>
          <Calc>
            <Val show={show}>{hm(T)}</Val> + {rest} phút = <Val show={show}>{hm(total / 60)}</Val>
          </Calc>
        </>
      )}
      <Step>Ô tô đến B lúc:</Step>
      <Calc>
        {clockStr(dep)} + <Val show={show}>{hm(total / 60)}</Val> = <Val show={show}>{clockStr(arrival)}</Val>
      </Calc>
      <Answer show={show} items={[clockStr(arrival)]} />
    </>
  );

  return (
    <LessonLayout
      slug="gio-den-noi"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel="Hình mô phỏng: ô tô đi từ A đến B, nghỉ ở trạm giữa đường, có đồng hồ chỉ giờ. Bên dưới là trục thời gian."
      readout={[
        { label: 'Đồng hồ', value: clockStr(dep + m), tone: 'time' },
        { label: 'Thời gian từ lúc khởi hành', value: hm(m / 60) },
        { label: 'Quãng đường đã đi', value: `${fmt(posKm(params, m), 1)} km`, tone: 'a' },
        { label: 'Trạng thái', value: status },
      ]}
      twoColumnFields
      fields={
        <>
          <RangeField id="sDep" label="Giờ khởi hành" tone="t" min={300} max={600} step={15}
            value={dep} display={clockStr(dep)} onChange={(v) => update({ dep: v })} />
          <RangeField id="sS" label="Quãng đường AB" tone="t" min={20} max={240} step={1}
            value={S} display={`${fmt(S)} km`} onChange={(v) => update({ S: v })} />
          <RangeField id="sV" label="Vận tốc ô tô" tone="a" min={20} max={88} step={4}
            value={V} display={`${V} km/giờ`} onChange={(v) => update({ V: v })} />
          <RangeField id="sRest" label="Thời gian nghỉ" tone="t" min={0} max={60} step={5}
            value={rest} display={rest > 0 ? `${rest} phút` : 'không nghỉ'} onChange={(v) => update({ rest: v })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Thời gian đi', text: 'quãng đường : vận tốc' },
        { term: 'Giờ đến', text: 'giờ khởi hành + thời gian đi + thời gian nghỉ' },
        { term: 'Giờ khởi hành', text: 'giờ đến − thời gian đi − thời gian nghỉ' },
      ]}
    />
  );
}
