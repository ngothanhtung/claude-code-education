'use client';

import { useState } from 'react';
import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, ConvLine, MinutesLine, Step } from '@/components/Notebook';
import { B, N, U, ap, eq, u } from '@/lib/tex';
import { useSimulation } from '@/hooks/useSimulation';
import { durationAns, fmt, hm, isExact } from '@/lib/format';
import { drawVanToc } from './sketch';

type Find = 'v' | 's' | 't';

interface Params {
  find: Find;
  s: number;
  v: number;
  t: number;
}

const FIND_OPTIONS = [
  { value: 'v', label: 'Vận tốc' },
  { value: 's', label: 'Quãng đường' },
  { value: 't', label: 'Thời gian' },
] as const;

/** Bộ số đầy đủ, tính từ hai đại lượng đã biết */
function numbers({ find, s, v, t }: Params) {
  if (find === 'v') return { S: s, T: t, V: s / t };
  if (find === 's') return { S: v * t, T: t, V: v };
  return { S: s, T: s / v, V: v };
}

export default function VanTocLesson() {
  const [params, setParams] = useState<Params>({ find: 'v', s: 135, v: 45, t: 3 });
  const { S, T, V } = numbers(params);
  const sim = useSimulation({ total: T });
  const update = (patch: Partial<Params>) => {
    setParams((prev) => ({ ...prev, ...patch }));
    sim.reset();
  };

  const { find } = params;
  const hideV = find === 'v' && !sim.done;
  const hideS = find === 's' && !sim.done;
  const show = sim.revealed;
  const e = sim.t;

  const doneLabel =
    find === 'v'
      ? `Vận tốc: ${isExact(V) ? '' : '≈ '}${fmt(V)} km/giờ`
      : find === 's'
        ? `Quãng đường AB: ${fmt(S)} km`
        : `Đến B sau ${hm(T)}`;

  const draw = (p: p5) =>
    drawVanToc(p, { S, T, V, e, hideV, hideS, done: sim.done, doneAt: sim.doneAt, doneLabel });

  const SNum = <Num tone="t">{params.s} km</Num>;
  const VNum = <Num tone="a">{params.v} km/giờ</Num>;
  const TNum = <Num tone="t">{hm(params.t)}</Num>;
  const problem = (
    <p>
      {find === 'v' && <>Một ô tô đi quãng đường AB dài {SNum} hết {TNum}. Tính vận tốc của ô tô.</>}
      {find === 's' && <>Một ô tô đi từ A đến B với vận tốc {VNum} và đi hết {TNum}. Tính quãng đường AB.</>}
      {find === 't' && (
        <>
          Một ô tô đi quãng đường AB dài {SNum} với vận tốc {VNum}. Hỏi ô tô đi hết quãng đường AB trong bao lâu?
        </>
      )}
    </p>
  );

  // Lời giải viết bằng LaTeX: N() số kiểu Việt Nam, U() đơn vị trong ngoặc, B() ô trống khi chưa hiện
  let solution;
  if (find === 'v') {
    solution = (
      <>
        <ConvLine hours={params.t} />
        <Step>Vận tốc của ô tô là:</Step>
        <Calc tex={`${params.s} \\chia ${N(params.t)} ${show ? eq(isExact(V)) : '='} ${B(show, N(V))}${U('km/giờ')}`} />
        <Answer show={show} items={[`$${ap(isExact(V))}${N(V)}${u('km/giờ')}$`]} />
      </>
    );
  } else if (find === 's') {
    solution = (
      <>
        <ConvLine hours={params.t} />
        <Step>Quãng đường AB dài là:</Step>
        <Calc tex={`${params.v} \\times ${N(params.t)} = ${B(show, N(S))}${U('km')}`} />
        <Answer show={show} items={[`$${N(S)}${u('km')}$`]} />
      </>
    );
  } else {
    solution = (
      <>
        <Step>Thời gian ô tô đi hết quãng đường AB là:</Step>
        <Calc tex={`${params.s} \\chia ${params.v} ${show ? eq(isExact(T)) : '='} ${B(show, N(T))}${U('giờ')}`} />
        <MinutesLine hours={T} show={show} />
        <Answer show={show} items={[durationAns(T)]} />
      </>
    );
  }

  return (
    <LessonLayout
      slug="van-toc-quang-duong-thoi-gian"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel="Hình mô phỏng: một ô tô đi từ A đến B. Bên dưới là sơ đồ đoạn thẳng chia theo từng giờ."
      readout={[
        {
          label: 'Thời gian đã đi',
          value: (sim.done && !isExact(e * 60, 0) ? '≈ ' : '') + hm(e),
          sub: `= ${fmt(e)} giờ`,
          tone: 'time',
        },
        { label: 'Quãng đường đã đi', value: `${fmt(V * e, 1)} km`, tone: 'a' },
        { label: 'Vận tốc', value: hideV ? '? km/giờ' : `${fmt(V)} km/giờ`, tone: 'a' },
        { label: 'Quãng đường AB', value: hideS ? '? km' : `${fmt(S, 1)} km` },
      ]}
      mode={
        <Segmented name="find" legend="Cần tìm" options={FIND_OPTIONS} value={find} onChange={(f) => update({ find: f })} />
      }
      fields={
        <>
          <RangeField id="sS" label="Quãng đường AB" tone="t" min={20} max={300} step={5}
            value={params.s} display={`${params.s} km`} onChange={(s) => update({ s })} hidden={find === 's'} />
          <RangeField id="sV" label="Vận tốc ô tô" tone="a" min={10} max={120} step={5}
            value={params.v} display={`${params.v} km/giờ`} onChange={(v) => update({ v })} hidden={find === 'v'} />
          <RangeField id="sT" label="Thời gian đi" tone="t" min={0.5} max={6} step={0.5}
            value={params.t} display={hm(params.t)} onChange={(t) => update({ t })} hidden={find === 't'} />
        </>
      }
      solution={solution}
      rules={[
        { key: 'v', term: 'Vận tốc', text: 'quãng đường : thời gian, $v = s \\chia t$' },
        { key: 's', term: 'Quãng đường', text: 'vận tốc × thời gian, $s = v \\times t$' },
        { key: 't', term: 'Thời gian', text: 'quãng đường : vận tốc, $t = s \\chia v$' },
      ]}
      activeRule={find}
    />
  );
}
