'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import type p5 from 'p5';
import { H, W } from '@/lib/draw/scene';
import { uiFont } from '@/app/fonts';

/**
 * p5 tự bọc tên font có khoảng trắng trong dấu ngoặc kép, nên chỉ truyền tên font đầu tiên
 * (next/font trả về chuỗi dạng "'Be Vietnam Pro', 'Be Vietnam Pro Fallback'").
 */
const CANVAS_FONT = uiFont.style.fontFamily.match(/'([^']+)'/)?.[1] ?? 'sans-serif';

/** Hàm vẽ một khung hình; được gọi ~60 lần/giây với state mới nhất */
export type Sketch = (p: p5) => void;

interface SimCanvasProps {
  draw: Sketch;
  /** mô tả cho trình đọc màn hình */
  label: string;
}

/**
 * Bọc p5.js (instance mode, chỉ chạy ở trình duyệt).
 * Canvas tạo một lần; mỗi khung hình gọi `draw` mới nhất nên không cần tạo lại khi state đổi.
 */
export default function SimCanvas({ draw, label }: SimCanvasProps) {
  const holder = useRef<HTMLDivElement>(null);
  const drawRef = useRef(draw);

  useLayoutEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    let instance: p5 | null = null;
    let cancelled = false;

    import('p5').then(({ default: P5 }) => {
      if (cancelled || !holder.current) return;
      instance = new P5((p: p5) => {
        p.setup = () => {
          const c = p.createCanvas(W, H);
          c.elt.setAttribute('aria-hidden', 'true');
          p.textFont(CANVAS_FONT);
        };
        p.draw = () => drawRef.current(p);
      }, holder.current);
    });

    return () => {
      cancelled = true;
      instance?.remove();
    };
  }, []);

  return <div ref={holder} className="canvas-holder" role="img" aria-label={label} />;
}
