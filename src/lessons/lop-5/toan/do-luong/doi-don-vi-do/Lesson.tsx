'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { DecimalField, Num, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step } from '@/components/Notebook';
import { B, NS, UN } from '@/lib/tex';
import { useParams } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { drawUnits } from './sketch';
import { KINDS, place, powerOf10, shiftDecimal, viNumber, type Kind } from './units';

interface Params {
  kind: Kind;
  value: string; // dạng chuẩn với dấu chấm, ví dụ "3.5"
  from: number;
  to: number;
}

const KIND_OPTIONS = (Object.keys(KINDS) as Kind[]).map((k) => ({ value: k, label: KINDS[k].label }));

const LABELS = playLabels('Dời dấu phẩy', 'Dời tiếp', 'Xem lại');

export default function DoiDonViLesson() {
  const { params, edit } = useParams<Params>({ kind: 'dientich', ...KINDS.dientich.preset });
  const info = KINDS[params.kind];
  const { value, from, to } = params;
  const k = info.k;

  const placement = place(value, info, from, to);
  const steps = Math.abs(to - from);
  const valid = steps > 0 && placement.fits;
  const shift = k * (to - from);
  const result = shiftDecimal(value, shift);

  const sim = useSimulation({ total: Math.max(steps, 1), enabled: valid, defaultDuration: 6, resetOn: params });
  const changeKind = (kind: Kind) => edit({ kind, ...KINDS[kind].preset });

  const show = sim.revealed;
  const fromU = info.units[from];
  const toU = info.units[to];
  const F = powerOf10(steps * k);
  const down = to > from; // từ đơn vị lớn sang đơn vị bé

  const draw = (p: p5) =>
    drawUnits(p, { kind: info, from, to, placement, value, result, t: sim.t, valid, done: sim.done });

  const unitOptions = info.units.map((u, i) => ({ value: i, label: u }));

  let notice: string | null = null;
  if (steps === 0) notice = 'Hãy chọn hai đơn vị khác nhau để đổi.';
  else if (!placement.fits) notice = 'Số này có quá nhiều chữ số so với bảng đơn vị. Hãy bớt chữ số hoặc chọn đơn vị khác.';

  const problem = (
    <p>
      Viết số thích hợp vào chỗ chấm:{' '}
      <Num tone="a">
        {viNumber(value)} {fromU}
      </Num>{' '}
      = ….{' '}
      <Num tone="b">{toU}</Num>
    </p>
  );

  const vIn = NS(viNumber(value));
  const vOut = NS(viNumber(result));
  const solution = !valid ? (
    <Step>{steps === 0 ? 'Hai đơn vị giống nhau, không cần đổi.' : 'Số quá dài, chưa đặt vừa bảng đơn vị.'}</Step>
  ) : (
    <>
      <Step>
        {down
          ? `Vì $1\\,${UN(fromU)} = ${NS(F)}\\,${UN(toU)}$ nên:`
          : `Vì $${NS(F)}\\,${UN(fromU)} = 1\\,${UN(toU)}$ nên:`}
      </Step>
      <Calc tex={`${vIn} ${down ? '\\times' : '\\chia'} ${NS(F)} = ${B(show, vOut)}`} />
      <Calc tex={`${vIn}\\,${UN(fromU)} = ${B(show, vOut)}\\,${UN(toU)}`} />
      <Answer show={show} items={[`$${vIn}\\,${UN(fromU)} = ${vOut}\\,${UN(toU)}$`]} />
    </>
  );

  const rules = [
    { term: `Hai đơn vị ${info.name} liền nhau`, text: `hơn kém nhau ${powerOf10(k)} lần` },
    { key: 'down', term: 'Đổi từ đơn vị lớn sang đơn vị bé', text: 'nhân, dấu phẩy dời sang phải' },
    { key: 'up', term: 'Đổi từ đơn vị bé sang đơn vị lớn', text: 'chia, dấu phẩy dời sang trái' },
    ...(params.kind === 'dientich' ? [{ term: 'Héc-ta', text: '$1\\,\\text{ha} = 1\\,\\text{hm}^2 = 10\\,000\\,\\text{m}^2$' }] : []),
    ...(params.kind === 'thetich' ? [{ term: 'Lít', text: '$1\\,\\text{dm}^3 = 1\\,\\text{lít}$' }] : []),
  ];

  return (
    <LessonLayout
      slug="doi-don-vi-do"
      sim={sim}
      problem={problem}
      notice={notice}
      draw={draw}
      canvasLabel={`Bảng đơn vị đo ${info.name}. Số đo được viết vào bảng, dấu phẩy dời từ cột ${fromU} sang cột ${toU}.`}
      readout={[
        { label: 'Số đo ban đầu', value: `${viNumber(value)} ${fromU}`, tone: 'a' },
        { label: 'Đổi sang', value: toU, tone: 'b' },
        { label: down ? 'Nhân với' : 'Chia cho', value: steps > 0 ? F : '–', tone: 'time' },
        { label: 'Kết quả', value: show && valid ? `${viNumber(result)} ${toU}` : `? ${toU}` },
      ]}
      mode={
        <>
          <Segmented name="kind" legend="Đại lượng" options={KIND_OPTIONS} value={params.kind} onChange={changeKind} />
          <Segmented name="from" legend="Từ đơn vị" options={unitOptions} value={from} onChange={(f) => edit({ from: f })} />
          <Segmented name="to" legend="Sang đơn vị" options={unitOptions} value={to} onChange={(t) => edit({ to: t })} />
        </>
      }
      fields={
        <DecimalField
          key={params.kind}
          id="value"
          label="Số đo"
          tone="a"
          value={value}
          onChange={(v) => edit({ value: v })}
          hint="Dùng dấu phẩy cho số thập phân, ví dụ 3,5"
          maxDigits={7}
        />
      }
      solution={solution}
      rules={rules}
      activeRule={steps > 0 ? (down ? 'down' : 'up') : undefined}
      playLabels={LABELS}
    />
  );
}
