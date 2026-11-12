'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { LIGHT_LABELS, Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { B, N, U, eq as teq, u } from '@/lib/tex';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { caption } from '@/lib/draw/geometry';
import { computeImage, describeImage, drawLensDiagram, type LensType } from '@/lib/draw/lens';
import { fmt, isExact } from '@/lib/format';

export interface Params {
  type: LensType;
  f: number;
  d: number;
  h: number;
}

const TYPE_OPTIONS = [
  { value: 'hoitu', label: 'Thấu kính hội tụ' },
  { value: 'phanky', label: 'Thấu kính phân kỳ' },
] as const;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ThauKinhLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 3, defaultDuration: 6, resetOn: ex.params });

  const img = computeImage(q.type, q.f, q.d, q.h);
  const nature = describeImage(q.type, q.f, q.d, img);
  const show = sim.revealed;
  const conv = q.type === 'hoitu';

  const draw = (p: p5) => {
    p.background(255);
    drawLensDiagram(p, { type: q.type, f: q.f, d: q.d, h: q.h, t: sim.t });
    if (sim.t <= 0) caption(p, 'Vật AB đặt vuông góc với trục chính của thấu kính');
    else if (sim.t < 1)
      caption(p, conv ? "Tia tới song song trục chính: tia ló đi qua tiêu điểm F'" : 'Tia tới song song trục chính: tia ló kéo dài đi qua tiêu điểm F');
    else if (sim.t < 2) caption(p, 'Tia tới đi qua quang tâm O: tia ló truyền thẳng');
    else caption(p, cap(nature));
  };

  const problem = (
    <p>
      Vật sáng AB cao <Num tone="a">{fmt(q.h)} cm</Num> đặt vuông góc với trục chính của một {conv ? 'thấu kính hội tụ' : 'thấu kính phân kỳ'} có
      tiêu cự <Num tone="t">f = {q.f} cm</Num>, điểm A nằm trên trục chính và cách thấu kính <Num tone="t">d = {q.d} cm</Num>.
      Dựng ảnh A&apos;B&apos;, nêu tính chất ảnh, tính khoảng cách từ ảnh đến thấu kính và chiều cao của ảnh.
    </p>
  );

  let solution;
  if (img.dp === null) {
    solution = (
      <>
        <Summary given={[`f = ${q.f}${u('cm')};\\ d = ${q.d}${u('cm')}`]} find={["A'B'"]} />
        <Step>
          {show
            ? 'Vật đặt đúng tại tiêu điểm $F$: các tia ló song song với nhau, không cho ảnh.'
            : <span className="blank">?</span>}
        </Step>
        <Answer show={show} items={['không có ảnh']} />
      </>
    );
  } else {
    const dp = img.dp;
    const hp = img.hp;
    // Tam giác đồng dạng thứ hai và biểu thức OA' như trong SGK, tùy loại thấu kính và tính chất ảnh
    const F = conv ? "F'" : 'F';
    const OF = `O${F}`;
    let ratio: string;
    let formula: string;
    if (!conv) {
      ratio = `(OF - OA') \\chia OF`;
      formula = `OA' = OA \\times OF \\chia (OA + OF) = ${q.d} \\times ${q.f} \\chia (${q.d} + ${q.f})`;
    } else if (img.real) {
      ratio = `(OA' - OF') \\chia OF'`;
      formula = `OA' = OA \\times OF' \\chia (OA - OF') = ${q.d} \\times ${q.f} \\chia (${q.d} - ${q.f})`;
    } else {
      ratio = `(OA' + OF') \\chia OF'`;
      formula = `OA' = OA \\times OF' \\chia (OF' - OA) = ${q.d} \\times ${q.f} \\chia (${q.f} - ${q.d})`;
    }
    solution = (
      <>
        <Summary
          given={[`${OF} = f = ${q.f}${u('cm')}`, `OA = d = ${q.d}${u('cm')};\\ AB = h = ${N(q.h)}${u('cm')}`]}
          find={["OA' = d'", "A'B' = h'"]}
        />
        <Step>Tính chất ảnh: {show ? `${nature}.` : <span className="blank">?</span>}</Step>
        <Step>{'Xét hai cặp tam giác đồng dạng ($OI = AB$):'}</Step>
        <Calc tex={"\\triangle ABO \\backsim \\triangle A'B'O \\Rightarrow A'B' \\chia AB = OA' \\chia OA \\quad (1)"} />
        <Calc
          tex={`\\triangle OI${F} \\backsim \\triangle A'B'${F} \\Rightarrow A'B' \\chia OI = A'${F} \\chia ${OF} = ${ratio} \\quad (2)`}
        />
        <Step>{`Từ (1) và (2): $OA' \\chia OA = ${ratio}$`}</Step>
        <Calc tex={`\\Rightarrow ${formula} ${teq(isExact(dp))} ${B(show, N(dp))}${U('cm')}`} />
        <Step>Chiều cao của ảnh:</Step>
        <Calc
          tex={`A'B' = AB \\times OA' \\chia OA = ${N(q.h)} \\times ${B(show, N(dp))} \\chia ${q.d} ${teq(isExact(hp))} ${B(show, N(hp))}${U('cm')}`}
        />
        <Answer
          show={show}
          items={[`$d' ${teq(isExact(dp))} ${N(dp)}${u('cm')}$`, `$h' ${teq(isExact(hp))} ${N(hp)}${u('cm')}$`, nature]}
        />
      </>
    );
  }

  return (
    <LessonLayout
      exercises={ex}
      slug="thau-kinh"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel="Dựng ảnh của vật AB qua thấu kính bằng hai tia sáng đặc biệt: tia song song trục chính và tia qua quang tâm."
      readout={[
        { label: 'Khoảng cách vật d', value: `${q.d} cm`, tone: 'a' },
        { label: 'Tiêu cự f', value: `${q.f} cm`, sub: q.d > 2 * q.f ? 'd > 2f' : q.d === 2 * q.f ? 'd = 2f' : q.d > q.f ? 'f < d < 2f' : q.d === q.f ? 'd = f' : 'd < f', tone: 'time' },
        { label: "Khoảng cách ảnh d'", value: show && img.dp !== null ? `${fmt(img.dp)} cm` : img.dp === null ? 'không có' : '?', tone: 'b' },
        { label: "Chiều cao ảnh h'", value: show && img.dp !== null ? `${fmt(img.hp)} cm` : img.dp === null ? '–' : '?', tone: 'b' },
      ]}
      mode={
        <Segmented name="type" legend="Dạng đề" options={TYPE_OPTIONS} value={q.type} onChange={(t) => ex.edit({ type: t })} />
      }
      fields={
        <>
          <RangeField id="f" label="Tiêu cự f" tone="t" min={5} max={20} step={1}
            value={q.f} display={`${q.f} cm`} onChange={(v) => ex.edit({ f: v })} />
          <RangeField id="d" label="Khoảng cách vật d" tone="a" min={2} max={50} step={1}
            value={q.d} display={`${q.d} cm`} onChange={(v) => ex.edit({ d: v })} />
          <RangeField id="h" label="Chiều cao vật" tone="a" min={1} max={5} step={0.5}
            value={q.h} display={`${fmt(q.h)} cm`} onChange={(v) => ex.edit({ h: v })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Tia qua quang tâm', text: 'truyền thẳng' },
        { term: 'Tia song song trục chính', text: "hội tụ: ló qua $F'$; phân kỳ: ló kéo dài qua $F$" },
        { term: 'Thấu kính hội tụ', text: '$d > f$: ảnh thật, ngược chiều; $d < f$: ảnh ảo, cùng chiều, lớn hơn vật' },
        { term: 'Thấu kính phân kỳ', text: 'luôn cho ảnh ảo, cùng chiều, nhỏ hơn vật' },
      ]}
      playLabels={LIGHT_LABELS}
    />
  );
}
