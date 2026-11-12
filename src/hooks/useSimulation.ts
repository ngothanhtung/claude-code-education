'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SimulationOptions {
  /** Độ dài mô phỏng theo đơn vị của bài (giờ hoặc phút) */
  total: number;
  /** false: không cho chạy (đề không hợp lệ) */
  enabled?: boolean;
  /** Số giây thực để chạy hết mô phỏng ở tốc độ "Vừa" */
  defaultDuration?: number;
  /**
   * Số liệu của đề (thường là `ex.params`): đổi giá trị (so bằng `Object.is`) thì mô phỏng tự về đầu
   * ngay trong lần render đó, nên bài học không cần tự gọi `sim.reset()` sau mỗi lần sửa số liệu.
   */
  resetOn?: unknown;
}

export interface Simulation {
  /** thời điểm hiện tại, cùng đơn vị với `total` */
  t: number;
  running: boolean;
  done: boolean;
  /** performance.now() lúc xong, dùng cho hiệu ứng hiện dần */
  doneAt: number;
  revealed: boolean;
  started: boolean;
  enabled: boolean;
  duration: number;
  defaultDuration: number;
  setDuration: (seconds: number) => void;
  toggle: () => void;
  reset: () => void;
  toggleReveal: () => void;
}

/**
 * Đồng hồ mô phỏng dùng chung cho mọi bài:
 * chạy / tạm dừng / làm lại, tự dừng khi đến `total`, tự hiện đáp án khi xong,
 * phím tắt Space (chạy/tạm dừng) và R (làm lại).
 */
export function useSimulation({ total, enabled = true, defaultDuration = 8, resetOn }: SimulationOptions): Simulation {
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [doneAt, setDoneAt] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [duration, setDuration] = useState(defaultDuration);
  const tRef = useRef(0);

  // Đề đổi số liệu: về đầu ngay khi render (mẫu "điều chỉnh state khi prop đổi" của React), không lỡ một khung hình với đáp án cũ
  const [seen, setSeen] = useState(resetOn);
  if (!Object.is(seen, resetOn)) {
    setSeen(resetOn);
    tRef.current = 0;
    setT(0);
    setRunning(false);
    setDone(false);
    setRevealed(false);
  }

  // Đổi dạng đề có thể đổi thời lượng mặc định: đưa tốc độ phát về "Vừa"
  useEffect(() => setDuration(defaultDuration), [defaultDuration]);

  // Vòng lặp thời gian khi đang chạy
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = Math.min(tRef.current + dt * (total / duration), total);
      tRef.current = next;
      setT(next);
      if (next >= total) {
        setRunning(false);
        setDone(true);
        setRevealed(true);
        setDoneAt(performance.now());
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, total, duration]);

  const reset = useCallback(() => {
    tRef.current = 0;
    setT(0);
    setRunning(false);
    setDone(false);
    setRevealed(false);
  }, []);

  const toggle = useCallback(() => {
    if (!enabled) return;
    if (done) {
      tRef.current = 0;
      setT(0);
      setDone(false);
      setRevealed(false);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  }, [enabled, done]);

  const toggleReveal = useCallback(() => setRevealed((r) => !r), []);

  // Phím tắt khi trình chiếu
  const keys = useRef({ toggle, reset });
  useEffect(() => {
    keys.current = { toggle, reset };
  }, [toggle, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      // Cửa sổ tự xử lý phím (vd. máy tính) thì không kích hoạt phím tắt mô phỏng
      if (target?.closest?.('[data-own-keys]')) return;
      const tag = target?.tagName;
      if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') {
        e.preventDefault();
        keys.current.toggle();
      } else if (e.key === 'r' || e.key === 'R') {
        keys.current.reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return {
    t,
    running,
    done,
    doneAt,
    revealed,
    started: t > 0,
    enabled,
    duration,
    defaultDuration,
    setDuration,
    toggle,
    reset,
    toggleReveal,
  };
}
