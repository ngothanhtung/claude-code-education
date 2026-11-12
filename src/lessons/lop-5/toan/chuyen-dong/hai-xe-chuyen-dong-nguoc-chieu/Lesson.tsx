'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, ConvLine, MinutesLine, Step } from '@/components/Notebook';
import { B, N, U, ap, eq, u } from '@/lib/tex';
import { useParams } from '@/hooks/useExercises';
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
  const { params, edit } = useParams<Params>({ mode: 'same', S: 120, vA: 40, vB: 60, d: 1 });
  const { mode, S, vA, vB, d } = params;

  const lead = mode === 'lead' ? d : 0;
  const valid = vA * lead < S;
  const meetT = (S + vB * lead) / (vA + vB); // tính từ lúc ô tô đỏ đi
  const answerT = meetT - lead; // tính từ lúc ô tô xanh đi

  const sim = useSimulation({ total: meetT, enabled: valid, resetOn: params });

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
  const eqT = show ? eq(isExact(answerT)) : '=';
  const apx = ap(isExact(answerT));

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
        <Calc tex={`${vA} + ${vB} = ${B(show, N(sum))}${U('km/giờ')}`} />
        <Step>Thời gian để hai ô tô gặp nhau là:</Step>
        <Calc tex={`${S} \\chia ${sum} ${eqT} ${B(show, N(answerT))}${U('giờ')}`} />
        <MinutesLine hours={answerT} show={show} />
        <Step>Quãng đường ô tô đỏ đi được là:</Step>
        <Calc tex={`${vA} \\times ${B(show, N(Tr))} = ${B(show, N(s1))}${U('km')}`} />
        <Step>Quãng đường ô tô xanh đi được là:</Step>
        <Calc tex={`${S} - ${B(show, N(s1))} = ${B(show, N(s2))}${U('km')}`} />
        <Answer show={show} items={[durationAns(answerT), `$${apx}${N(s1)}${u('km')}$`, `$${apx}${N(s2)}${u('km')}$`]} />
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
        <Calc tex={`${vA} \\times ${N(d)} = ${B(show, N(d0))}${U('km')}`} />
        <Step>Quãng đường còn lại là:</Step>
        <Calc tex={`${S} - ${B(show, N(d0))} = ${B(show, N(rem))}${U('km')}`} />
        <Step>Tổng vận tốc của hai ô tô là:</Step>
        <Calc tex={`${vA} + ${vB} = ${B(show, N(sum))}${U('km/giờ')}`} />
        <Step>Thời gian từ lúc ô tô xanh đi đến lúc gặp nhau là:</Step>
        <Calc tex={`${B(show, N(rem))} \\chia ${B(show, N(sum))} ${eqT} ${B(show, N(answerT))}${U('giờ')}`} />
        <MinutesLine hours={answerT} show={show} />
        <Step>Chỗ gặp nhau cách B là:</Step>
        <Calc tex={`${vB} \\times ${B(show, N(Tr))} = ${B(show, N(fromB))}${U('km')}`} />
        <Step>Chỗ gặp nhau cách A là:</Step>
        <Calc tex={`${S} - ${B(show, N(fromB))} = ${B(show, N(fromA))}${U('km')}`} />
        <Answer show={show} items={[durationAns(answerT), `$${apx}${N(fromA)}${u('km')}$`]} />
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
        <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={mode} onChange={(m) => edit({ mode: m })} />
      }
      fields={
        <>
          <RangeField id="sS" label="Quãng đường AB" tone="t" min={50} max={300} step={10}
            value={S} display={`${S} km`} onChange={(v) => edit({ S: v })} />
          <RangeField id="sA" label="Vận tốc ô tô đỏ" tone="a" min={10} max={120} step={5}
            value={vA} display={`${vA} km/giờ`} onChange={(v) => edit({ vA: v })} />
          <RangeField id="sB" label="Vận tốc ô tô xanh" tone="b" min={10} max={120} step={5}
            value={vB} display={`${vB} km/giờ`} onChange={(v) => edit({ vB: v })} />
          <RangeField id="sD" label="Ô tô đỏ đi trước" tone="t" min={0.5} max={3} step={0.5}
            value={d} display={hm(d)} onChange={(v) => edit({ d: v })} hidden={mode !== 'lead'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Tổng vận tốc', text: 'vận tốc xe thứ nhất + vận tốc xe thứ hai, $v = v_1 + v_2$' },
        { term: 'Thời gian gặp nhau', text: 'quãng đường (lúc hai xe cùng chạy) : tổng vận tốc, $t = s \\chia (v_1 + v_2)$' },
        { term: 'Quãng đường mỗi xe đi', text: 'vận tốc của xe × thời gian đi, $s_1 = v_1 \\times t$' },
      ]}
    />
  );
}
