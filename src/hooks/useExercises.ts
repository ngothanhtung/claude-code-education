'use client';

import { useCallback, useState } from 'react';

/** Một bài tập soạn sẵn: bộ số liệu (kể cả dạng đề / đại lượng cần tìm) */
export type ExerciseList<P> = readonly P[];

export interface Exercises<P> {
  params: P;
  /** chỉ số bài tập đang mở; null khi giáo viên đã tự đổi số liệu */
  current: number | null;
  count: number;
  pick: (index: number) => void;
  /** đổi một phần số liệu (thanh trượt, dạng đề): đề trở thành "tự đặt" */
  edit: (patch: Partial<P>) => void;
}

/**
 * Bộ 5 bài tập của một bài học. Mở bài là Bài tập 1; chọn bài khác thì nạp số liệu soạn sẵn,
 * kéo thanh trượt thì đề thành "tự đặt số liệu". `fix` chuẩn hóa số liệu sau mỗi lần đổi
 * (ví dụ giữ điểm M thấp hơn độ cao thả vật).
 */
export function useExercises<P>(list: ExerciseList<P>, fix?: (p: P) => P): Exercises<P> {
  const [state, setState] = useState<{ params: P; current: number | null }>({ params: list[0], current: 0 });

  const pick = useCallback((i: number) => setState({ params: list[i], current: i }), [list]);

  const edit = useCallback(
    (patch: Partial<P>) =>
      setState((s) => {
        const next = { ...s.params, ...patch };
        return { params: fix ? fix(next) : next, current: null };
      }),
    [fix],
  );

  return { params: state.params, current: state.current, count: list.length, pick, edit };
}

/**
 * Số liệu của bài không có bộ bài tập soạn sẵn (Toán 5): một bộ mặc định, `edit(patch)` gộp phần thay đổi
 * rồi chuẩn hóa bằng `fix`. Truyền `params` vào `useSimulation({ resetOn })` để mô phỏng tự về đầu.
 */
export function useParams<P>(initial: P, fix?: (p: P) => P): { params: P; edit: (patch: Partial<P>) => void } {
  const [params, setParams] = useState(initial);
  const edit = useCallback(
    (patch: Partial<P>) =>
      setParams((prev) => {
        const next = { ...prev, ...patch };
        return fix ? fix(next) : next;
      }),
    [fix],
  );
  return { params, edit };
}
