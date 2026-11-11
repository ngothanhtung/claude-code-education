'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BY_SYMBOL } from '@/lib/elements';
import { ALL3D, type Mol3D, type Mol3DGroup, type Mol3DId } from '@/lib/molecules3d';

/**
 * Mô hình phân tử 3D xoay được (3Dmol.js, nạp động chỉ khi trang cần).
 * Tọa độ thật lấy từ PubChem, đóng gói sẵn trong public/molecules/<file>.sdf để chạy khi không có mạng.
 * - files: các phân tử của bài (chip chọn); value: phân tử đang xét theo bộ chọn của bài (ô 3D đi theo).
 * - groups: các nhóm so sánh, hiển thị 2–4 phân tử cạnh nhau, xoay đồng bộ.
 * Kéo chuột để xoay; bánh xe chuột vẫn cuộn trang (phóng to, thu nhỏ bằng nút).
 */

type Style = 'bong' | 'dac';

interface Viewer {
  addModel(data: string, format: string): unknown;
  setStyle(sel: object, style: object): void;
  removeAllLabels(): void;
  zoomTo(): void;
  zoom(factor: number, animation?: number): void;
  render(): void;
  resize(): void;
  spin(axis: string | boolean, speed?: number): void;
  linkViewer(other: Viewer): void;
  selectedAtoms(sel: object): { elem: string }[];
  addLabel(text: string, options: object): unknown;
  removeLabel(label: unknown): void;
  setHoverable(sel: object, on: boolean, hover: (atom: HoverAtom, v: Viewer) => void, unhover: (atom: HoverAtom, v: Viewer) => void): void;
  setClickable(sel: object, on: boolean, click: (atom: HoverAtom, v: Viewer) => void): void;
  setViewChangeCallback(cb: (view: number[]) => void): void;
  getView(): number[];
  clear(): void;
}

interface HoverAtom {
  elem: string;
  x: number;
  y: number;
  z: number;
  label?: unknown;
  pinned?: boolean;
}

/** Màu nguyên tố theo quy ước Jmol (giống màu 3Dmol vẽ quả cầu), dùng cho chú giải */
const JMOL: Record<string, string> = {
  H: '#FFFFFF', He: '#D9FFFF', Li: '#CC80FF', Be: '#C2FF00', B: '#FFB5B5', C: '#909090', N: '#3050F8', O: '#FF0D0D',
  F: '#90E050', Ne: '#B3E3F5', Na: '#AB5CF2', Mg: '#8AFF00', Al: '#BFA6A6', Si: '#F0C8A0', P: '#FF8000', S: '#FFFF30',
  Cl: '#1FF01F', Ar: '#80D1E3', K: '#8F40D4', Ca: '#3DFF00', Ti: '#BFC2C7', Cr: '#8A99C7', Fe: '#E06633', Co: '#F090A0',
  Ni: '#50D050', Cu: '#C88033', Zn: '#7D80B0', Br: '#A62929', Kr: '#5CB8D1', Ag: '#C0C0C0', I: '#940094', Xe: '#429EB0',
  Ba: '#00C900', W: '#2194D6', Pt: '#D0D0E0', Au: '#FFD123', Pb: '#575961',
};

const STYLES: Record<Style, object> = {
  bong: { stick: { radius: 0.14, colorscheme: 'Jmol' }, sphere: { scale: 0.28, colorscheme: 'Jmol' } },
  dac: { sphere: { scale: 1, colorscheme: 'Jmol' } },
};

/** Tải SDF một lần cho cả trang */
const sdfCache = new Map<string, Promise<string>>();
function loadSdf(file: string) {
  if (!sdfCache.has(file)) {
    sdfCache.set(
      file,
      fetch(`/molecules/${file}.sdf`).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      }),
    );
  }
  return sdfCache.get(file)!;
}

/** Bán kính van der Waals (Å) theo bảng 3Dmol dùng để vẽ quả cầu */
const VDW: Record<string, number> = { H: 1.2, C: 1.7, N: 1.55, O: 1.52, F: 1.47, P: 1.8, S: 1.8, Cl: 1.75, Br: 1.85, I: 1.98 };
/** Nguyên tố có quả cầu màu sáng: chữ màu tối cho dễ đọc */
const DARK_TEXT = new Set(['H', 'He', 'F', 'Cl', 'S', 'Ne', 'Ar', 'Mg', 'Ca', 'Be', 'B', 'Si', 'Al', 'Ag', 'Pt', 'Au', 'Ni', 'Ti', 'Cr', 'Zn', 'Li', 'Kr', 'Xe']);

interface AtomLabel {
  a: HoverAtom;
  label: { sprite: { position: { set(x: number, y: number, z: number): void } } };
  /** bán kính quả cầu đang vẽ (Å) */
  r: number;
}
const LABELS = new WeakMap<Viewer, AtomLabel[]>();

/**
 * Đặt nhãn lên mặt quả cầu, phía người xem: tâm nguyên tử + bán kính × hướng nhìn.
 * Hướng nhìn trong hệ toạ độ phân tử = vector (0, 0, 1) quay ngược bởi phép quay của mô hình (view[4..7]).
 * Nhãn được kiểm tra chiều sâu (inFront: false) nên quả cầu phía trước che nhãn phía sau như vật thật.
 */
function placeLabels(v: Viewer, view: number[]) {
  const list = LABELS.get(v);
  if (!list?.length) return;
  const [qx, qy, qz, qw] = [-view[4], -view[5], -view[6], view[7]]; // nghịch đảo của quaternion đơn vị
  // quay u = (0, 0, 1): t = 2 (q × u); u' = u + w t + q × t
  const tx = 2 * qy;
  const ty = -2 * qx;
  const dx = qw * tx + (qy * 0 - qz * ty);
  const dy = qw * ty + (qz * tx - qx * 0);
  const dz = 1 + (qx * ty - qy * tx);
  for (const { a, label, r } of list) {
    const k = r + 0.08;
    label.sprite.position.set(a.x + dx * k, a.y + dy * k, a.z + dz * k);
  }
}

function applyStyle(v: Viewer, mol: Mol3D, style: Style, spin: boolean) {
  v.removeAllLabels();
  const n = v.selectedAtoms({}).length;
  if (mol.spheres) {
    // mạng kim loại, ion, khí hiếm: chỉ vẽ quả cầu; "Đặc" là kích thước thật (các nguyên tử chạm nhau)
    v.setStyle({}, {});
    for (const [el, r] of Object.entries(mol.spheres)) {
      v.setStyle({ elem: el }, { sphere: { radius: style === 'dac' ? r : r * 0.5, colorscheme: 'Jmol' } });
    }
  } else v.setStyle({}, STYLES[style]);

  // Chữ nguyên tố gắn trên mặt từng quả cầu (mạng tinh thể lớn thì chỉ dùng chú giải màu;
  // phân tử lớn thì bỏ chữ H cho đỡ rối)
  const atoms = v.selectedAtoms({}) as unknown as HoverAtom[];
  const list: AtomLabel[] = [];
  if (!(mol.spheres && n > 30)) {
    for (const a of atoms) {
      if (!mol.spheres && n > 30 && a.elem === 'H') continue;
      const r = mol.spheres
        ? mol.spheres[a.elem] * (style === 'dac' ? 1 : 0.5)
        : (VDW[a.elem] ?? 1.6) * (style === 'dac' ? 1 : 0.28);
      const label = v.addLabel(a.elem, {
        position: { x: a.x, y: a.y, z: a.z }, alignment: 'center', inFront: false,
        fontSize: a.elem === 'H' ? 11 : 13, fontColor: DARK_TEXT.has(a.elem) ? '#1D2540' : 'white',
        showBackground: false, backgroundOpacity: 0, borderThickness: 0,
      }) as AtomLabel['label'];
      list.push({ a, label, r });
    }
  }
  LABELS.set(v, list);
  placeLabels(v, v.getView());
  v.zoomTo();
  // zoomTo chừa lề rộng; phân tử càng nhỏ càng cần phóng to để chiếm phần lớn khung
  // mô hình quả cầu (mạng kim loại, ion, khí hiếm) chiếm nhiều chỗ hơn nên phóng ít hơn
  const k = mol.spheres ? (n <= 30 ? 1 : 0.9) : n <= 10 ? 2.3 : n <= 20 ? 1.8 : n <= 30 ? 1.45 : n <= 50 ? 1.1 : 0.95;
  v.zoom(style === 'dac' ? k * 0.85 : k);
  v.render();
  v.spin(spin ? 'y' : false, 0.5);
}

/** Một ô 3D */
function Cell({ file, style, spin, onReady }: { file: Mol3DId; style: Style; spin: boolean; onReady: (v: Viewer | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [elems, setElems] = useState<string[]>([]);
  const [hovered, setHovered] = useState('');
  const mol = ALL3D[file];

  useEffect(() => {
    let cancelled = false;
    const el = box.current;
    if (!el) return;
    const stopWheel = (e: WheelEvent) => e.stopPropagation();
    el.addEventListener('wheel', stopWheel, { capture: true });
    (async () => {
      try {
        const [$3Dmol, data] = await Promise.all([import('3dmol'), mol.gen ? Promise.resolve(mol.gen()) : loadSdf(file)]);
        if (cancelled) return;
        const v = $3Dmol.createViewer(el, { backgroundColor: 'white', antialias: true }) as unknown as Viewer;
        v.addModel(data, mol.gen ? 'xyz' : 'sdf');
        // Nhãn tên nguyên tố ngay phía trên đúng nguyên tử: hiện khi rê chuột, bấm (chạm) để giữ hoặc bỏ
        const nameOf = (a: HoverAtom) => `${a.elem} (${BY_SYMBOL[a.elem]?.name ?? a.elem})`;
        const show = (a: HoverAtom, vw: Viewer) => {
          if (a.label) return;
          a.label = vw.addLabel(nameOf(a), {
            position: { x: a.x, y: a.y, z: a.z }, alignment: 'bottomCenter', screenOffset: { x: 0, y: -14 },
            backgroundColor: '#3B2A8C', backgroundOpacity: 0.92, fontColor: 'white', fontSize: 13, inFront: true,
          });
          vw.render();
        };
        const hide = (a: HoverAtom, vw: Viewer) => {
          if (!a.label || a.pinned) return;
          vw.removeLabel(a.label);
          delete a.label;
          vw.render();
        };
        v.setHoverable({}, true, (a, vw) => { show(a, vw); setHovered(nameOf(a)); }, (a, vw) => { hide(a, vw); setHovered(''); });
        v.setClickable({}, true, (a, vw) => {
          a.pinned = !a.pinned;
          if (a.pinned) show(a, vw);
          else hide(a, vw);
          setHovered(nameOf(a));
        });
        // mỗi lần vẽ lại (xoay, kéo, phóng to): dời nhãn theo hướng nhìn mới rồi vẽ lại một lần
        let busy = false;
        v.setViewChangeCallback((view) => {
          if (busy) return;
          placeLabels(v, view);
          busy = true;
          v.render();
          busy = false;
        });
        viewer.current = v;
        setElems([...new Set(v.selectedAtoms({}).map((a) => a.elem))]);
        setState('ready');
        onReady(v);
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    const ro = new ResizeObserver(() => viewer.current?.resize());
    ro.observe(el);
    return () => {
      cancelled = true;
      ro.disconnect();
      el.removeEventListener('wheel', stopWheel, { capture: true });
      viewer.current?.clear();
      viewer.current = null;
      onReady(null);
    };
    // onReady ổn định theo vị trí ô (useCallback ở cha)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    if (viewer.current && state === 'ready') applyStyle(viewer.current, mol, style, spin);
  }, [style, spin, state]);

  return (
    <figure className="mol3d-cell">
      <div className="mol3d-view" ref={box} role="img" aria-label={`Mô hình 3D phân tử ${mol.name}, kéo chuột để xoay`}>
        {state !== 'ready' && <p className="mol3d-msg">{state === 'loading' ? 'Đang tải mô hình 3D…' : 'Không tải được mô hình 3D'}</p>}
      </div>
      <figcaption>
        <b>{mol.name}</b> <span className="f">{mol.formula}</span>
        <span className="n">{mol.note}</span>
        {elems.length > 0 && (
          <span className="mol3d-legend" aria-label="Chú giải màu nguyên tố">
            {elems.map((el) => (
              <span key={el}>
                <i style={{ background: JMOL[el] ?? '#999' }} aria-hidden="true" />
                <b>{el}</b> {BY_SYMBOL[el]?.name}
              </span>
            ))}
          </span>
        )}
        <span className="mol3d-hover" aria-live="polite">{hovered && `Đang chỉ: ${hovered}`}</span>
      </figcaption>
    </figure>
  );
}

/** Nhãn chip: công thức; trùng công thức (đồng phân) hoặc công thức dài thì dùng tên ngắn */
function chipLabel(f: Mol3DId, files: Mol3DId[]) {
  const m = ALL3D[f];
  const dup = files.some((g) => g !== f && ALL3D[g].formula === m.formula);
  return dup || m.formula.length > 12 ? m.name.split(' (')[0] : m.formula;
}

export default function Molecule3D({ files, value, groups = [], initialGroup }: { files: Mol3DId[]; value?: Mol3DId; groups?: Mol3DGroup[]; initialGroup?: number }) {
  const [one, setOne] = useState<Mol3DId>(value ?? files[0]);
  const [group, setGroup] = useState<number | null>(initialGroup ?? null);
  const [style, setStyle] = useState<Style>('bong');
  const [spin, setSpin] = useState(true);
  const viewers = useRef<(Viewer | null)[]>([]);
  const [readyCount, setReadyCount] = useState(0);

  // Bộ chọn của bài đổi chất → ô 3D đổi theo (thoát chế độ so sánh)
  useEffect(() => {
    if (value) {
      setOne(value);
      setGroup(null);
    }
  }, [value]);

  const shown: Mol3DId[] = group === null ? [one] : groups[group].files;

  const onReady = useCallback((i: number, v: Viewer | null) => {
    viewers.current[i] = v;
    setReadyCount(viewers.current.filter(Boolean).length);
  }, []);
  const readyFns = useRef<((v: Viewer | null) => void)[]>([]);
  for (let i = 0; i < 4; i++) readyFns.current[i] ??= (v) => onReady(i, v);

  // Các ô so sánh xoay đồng bộ
  useEffect(() => {
    const vs = viewers.current.slice(0, shown.length).filter(Boolean) as Viewer[];
    if (vs.length < 2 || vs.length !== shown.length) return;
    vs.forEach((a) => vs.forEach((b) => a !== b && a.linkViewer(b)));
  }, [readyCount, shown.length]);

  const zoomAll = (k: number) =>
    viewers.current.slice(0, shown.length).forEach((v) => {
      v?.zoom(k, 200);
      v?.render();
    });

  return (
    <section className="mol3d" aria-label="Mô hình phân tử 3D">
      <div className="mol3d-head">
        <span className="mol3d-title">Mô hình 3D</span>
        <span className="mol3d-tools" role="group" aria-label="Điều khiển mô hình 3D">
          <button type="button" aria-pressed={style === 'bong'} onClick={() => setStyle('bong')}>Quả cầu – thanh nối</button>
          <button type="button" aria-pressed={style === 'dac'} onClick={() => setStyle('dac')}>Đặc</button>
          <button type="button" aria-pressed={spin} onClick={() => setSpin((x) => !x)}>Tự xoay</button>
          <button type="button" aria-label="Phóng to" onClick={() => zoomAll(1.2)}>+</button>
          <button type="button" aria-label="Thu nhỏ" onClick={() => zoomAll(1 / 1.2)}>−</button>
        </span>
      </div>
      {(files.length > 1 || groups.length > 0) && (
        <div className="mol3d-pick" role="group" aria-label="Chọn phân tử hoặc nhóm so sánh">
          {files.length > 1 &&
            files.map((f) => (
              <button key={f} type="button" aria-pressed={group === null && one === f} onClick={() => { setOne(f); setGroup(null); }}>
                {chipLabel(f, files)}
              </button>
            ))}
          {groups.map((g, i) => (
            <button key={g.label} type="button" className="cmp" aria-pressed={group === i} onClick={() => setGroup(i)}>
              So sánh: {g.label}
            </button>
          ))}
        </div>
      )}
      <div className={`mol3d-grid n${shown.length}`}>
        {shown.map((f, i) => (
          <Cell key={`${group ?? 'one'}-${i}-${f}`} file={f} style={style} spin={spin} onReady={readyFns.current[i]} />
        ))}
      </div>
      <p className="mol3d-note">
        Kéo chuột để xoay{shown.length > 1 ? ' (các mô hình xoay cùng nhau)' : ''}, rê chuột hoặc bấm vào quả cầu để xem tên nguyên tố.{' '}
        {shown.some((f) => ALL3D[f].gen)
          ? 'Tọa độ dựng từ số liệu đo thực nghiệm (độ dài liên kết, hằng số mạng): khoảng cách giữa các nguyên tử đúng tỉ lệ.'
          : 'Tọa độ nguyên tử thật (PubChem): góc và độ dài liên kết đúng tỉ lệ.'}
      </p>
    </section>
  );
}
