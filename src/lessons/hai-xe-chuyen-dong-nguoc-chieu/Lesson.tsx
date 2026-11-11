'use client';

import { useState } from 'react';
import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented } from '@/components/controls';
import { Answer, Calc, ConvLine, MinutesLine, Step, Val } from '@/components/notebook';
import { useSimulation } from '@/hooks/useSimulation';
import { durationAns, fmt, hm, isExact, round2 } from '@/lib/format';
import { drawNguoc } from './sketch';

type Mode = 'same' | 'lead';

interface Params {
  mode: Mode;
  S: number;
  vA: number;
  vB: number;
  /** dạng 2: số giờ ô tô đỏ đi trước */
  d: number;
}

const MODE_OPTIONS = [
  { value: 'same', label: 'Xuất phát cùng lúc' },
  { value: 'lead', label: 'Một xe đi trước' },
] as const;

export default function NguocChieuLesson() {
  const [params, setParams] = useState<Params>({ mode: 'same', S: 120, vA: 40, vB: 60, d: 1 });
  const { mode, S, vA, vB, d } = params;

  const lead = mode === 'lead' ? d : 0;
  const valid = vA * lead < S;
  const meetT = (S + vB * lead) / (vA + vB); // tính từ lúc ô tô đỏ đi
  const answerT = meetT - lead; // tính từ lúc ô tô xanh đi

  const sim = useSimulation({ total: meetT, enabled: valid });
  const update = (patch: Partial<Params>) => {
    setParams((prev) => ({ ...prev, ...patch }));
    sim.reset();
  };

  const t = sim.t;
  const show = sim.revealed;
  const tB = Math.max(t - lead, 0);
  const sA = vA * t;
  const sB = vB * tB;

  const draw = (p: p5) =>
    drawNguoc(p, { S, vA, vB, lead, valid, t, met: sim.done, metAt: sim.doneAt, answerT });

  const SNum = <Num tone="t">{S} km</Num>;
  const ANum = <Num tone="a">{vA} km/giờ</Num>;
  const BNum = <Num tone="b">{vB} km/giờ</Num>;
  const problem =
    mode === 'lead' ? (
      <>
        <p>
          Quãng đường AB dài {SNum}. Một ô tô màu đỏ đi từ A về B với vận tốc {ANum}. Sau{' '}
          <Num tone="t">{hm(d)}</Num>, một ô tô màu xanh đi từ B về A với vận tốc {BNum}. Hỏi:
        </p>
        <ol>
          <li>Sau bao lâu kể từ lúc ô tô xanh khởi hành thì hai xe gặp nhau?</li>
          <li>Chỗ gặp nhau cách A bao nhiêu ki-lô-mét?</li>
        </ol>
      </>
    ) : (
      <>
        <p>
          Quãng đường AB dài {SNum}. Cùng một lúc, một ô tô màu đỏ đi từ A về B với vận tốc {ANum} và một ô tô
          màu xanh đi từ B về A với vận tốc {BNum}. Hỏi:
        </p>
        <ol>
          <li>Sau bao lâu hai ô tô gặp nhau?</li>
          <li>Lúc gặp nhau, mỗi ô tô đi được bao nhiêu ki-lô-mét?</li>
        </ol>
      </>
    );

  // Làm tròn thời gian đến 2 chữ số rồi dùng chính số đó để tính tiếp, như học sinh làm trong vở
  const sum = vA + vB;
  const Tr = round2(answerT);
  const eqT = show && !isExact(answerT) ? '≈' : '=';
  const ap = isExact(answerT) ? '' : '≈ ';

  let solution;
  if (!valid) {
    solution = (
      <>
        <Step>Ô tô đỏ đã đến B trước khi</Step>
        <Step>ô tô xanh khởi hành, nên hai xe</Step>
        <Step>không gặp nhau trên đường AB.</Step>
      </>
    );
  } else if (mode === 'same') {
    const s1 = round2(vA * Tr);
    const s2 = round2(S - s1);
    solution = (
      <>
        <Step>Tổng vận tốc của hai ô tô là:</Step>
        <Calc>{vA} + {vB} = <Val show={show}>{sum}</Val> (km/giờ)</Calc>
        <Step>Thời gian để hai ô tô gặp nhau là:</Step>
        <Calc>{S} : {sum} {eqT} <Val show={show}>{fmt(answerT)}</Val> (giờ)</Calc>
        <MinutesLine hours={answerT} show={show} />
        <Step>Quãng đường ô tô đỏ đi được là:</Step>
        <Calc>{vA} × <Val show={show}>{fmt(Tr)}</Val> = <Val show={show}>{fmt(s1)}</Val> (km)</Calc>
        <Step>Quãng đường ô tô xanh đi được là:</Step>
        <Calc>{S} − <Val show={show}>{fmt(s1)}</Val> = <Val show={show}>{fmt(s2)}</Val> (km)</Calc>
        <Answer show={show} items={[durationAns(answerT), `${ap}${fmt(s1)} km`, `${ap}${fmt(s2)} km`]} />
      </>
    );
  } else {
    const d0 = vA * d;
    const rem = S - d0;
    const fromB = round2(vB * Tr);
    const fromA = round2(S - fromB);
    solution = (
      <>
        <ConvLine hours={d} />
        <Step>Quãng đường ô tô đỏ đi trước là:</Step>
        <Calc>{vA} × {fmt(d)} = <Val show={show}>{fmt(d0)}</Val> (km)</Calc>
        <Step>Quãng đường còn lại là:</Step>
        <Calc>{S} − <Val show={show}>{fmt(d0)}</Val> = <Val show={show}>{fmt(rem)}</Val> (km)</Calc>
        <Step>Tổng vận tốc của hai ô tô là:</Step>
        <Calc>{vA} + {vB} = <Val show={show}>{sum}</Val> (km/giờ)</Calc>
        <Step>Thời gian từ lúc ô tô xanh đi đến lúc gặp nhau là:</Step>
        <Calc>
          <Val show={show}>{fmt(rem)}</Val> : <Val show={show}>{sum}</Val> {eqT} <Val show={show}>{fmt(answerT)}</Val> (giờ)
        </Calc>
        <MinutesLine hours={answerT} show={show} />
        <Step>Chỗ gặp nhau cách B là:</Step>
        <Calc>{vB} × <Val show={show}>{fmt(Tr)}</Val> = <Val show={show}>{fmt(fromB)}</Val> (km)</Calc>
        <Step>Chỗ gặp nhau cách A là:</Step>
        <Calc>{S} − <Val show={show}>{fmt(fromB)}</Val> = <Val show={show}>{fmt(fromA)}</Val> (km)</Calc>
        <Answer show={show} items={[durationAns(answerT), `${ap}${fmt(fromA)} km`]} />
      </>
    );
  }

  const approxTime = (x: number) => (sim.done && !isExact(x * 60, 0) ? '≈ ' : '') + hm(x);

  return (
    <LessonLayout
      slug="hai-xe-chuyen-dong-nguoc-chieu"
      sim={sim}
      problem={problem}
      notice={
        valid
          ? null
          : `Ô tô đỏ đi trước ${hm(d)} đã đi được ${fmt(vA * d)} km, tức là đã đến B trước khi ô tô xanh khởi hành. Hãy tăng quãng đường AB hoặc giảm thời gian đi trước.`
      }
      draw={draw}
      canvasLabel="Hình mô phỏng: ô tô đỏ đi từ A, ô tô xanh đi từ B, chạy ngược chiều nhau. Bên dưới là sơ đồ đoạn thẳng AB."
      readout={[
        lead > 0
          ? { label: 'Thời gian ô tô xanh đi', value: approxTime(tB), sub: `ô tô đỏ: ${hm(t)}`, tone: 'time' }
          : { label: 'Thời gian đã đi', value: approxTime(t), sub: `= ${fmt(t)} giờ`, tone: 'time' },
        { label: 'Ô tô đỏ đã đi', value: `${fmt(sA, 1)} km`, tone: 'a' },
        { label: 'Ô tô xanh đã đi', value: `${fmt(sB, 1)} km`, tone: 'b' },
        { label: 'Hai xe còn cách nhau', value: `${fmt(Math.max(S - sA - sB, 0), 1)} km` },
      ]}
      mode={
        <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={mode} onChange={(m) => update({ mode: m })} />
      }
      twoColumnFields={mode === 'lead'}
      fields={
        <>
          <RangeField id="sS" label="Quãng đường AB" tone="t" min={50} max={300} step={10}
            value={S} display={`${S} km`} onChange={(v) => update({ S: v })} />
          <RangeField id="sA" label="Vận tốc ô tô đỏ" tone="a" min={10} max={120} step={5}
            value={vA} display={`${vA} km/giờ`} onChange={(v) => update({ vA: v })} />
          <RangeField id="sB" label="Vận tốc ô tô xanh" tone="b" min={10} max={120} step={5}
            value={vB} display={`${vB} km/giờ`} onChange={(v) => update({ vB: v })} />
          <RangeField id="sD" label="Ô tô đỏ đi trước" tone="t" min={0.5} max={3} step={0.5}
            value={d} display={hm(d)} onChange={(v) => update({ d: v })} hidden={mode !== 'lead'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Tổng vận tốc', text: 'vận tốc xe thứ nhất + vận tốc xe thứ hai' },
        { term: 'Thời gian gặp nhau', text: 'quãng đường (lúc hai xe cùng chạy) : tổng vận tốc' },
        { term: 'Quãng đường mỗi xe đi', text: 'vận tốc của xe × thời gian đi' },
      ]}
    />
  );
}
