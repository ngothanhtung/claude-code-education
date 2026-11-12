'use client';

import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CalculatorIcon, Grid3x3Icon, type LucideIcon } from 'lucide-react';

/**
 * Trạng thái mở/đóng của các cửa sổ nổi (Máy tính, Bảng tuần hoàn) do nút tròn trong `.tool-dock` của trang bài điều khiển.
 * Cửa sổ được gắn một lần ở app/layout.tsx. Sidebar "Tiện ích & công cụ" không dùng cửa sổ này mà mở bản toàn trang
 * (/bang-tuan-hoan, /may-tinh) trong tab mới.
 */
export type ToolId = 'calculator' | 'periodicTable';

type State = Record<ToolId, boolean>;

/** Tên, icon và id cửa sổ (aria-controls) của từng công cụ: dùng chung cho sidebar và nút nổi */
export const TOOLS: Record<ToolId, { label: string; icon: LucideIcon; panelId: string }> = {
  periodicTable: { label: 'Bảng tuần hoàn', icon: Grid3x3Icon, panelId: 'bang-tuan-hoan' },
  calculator: { label: 'Máy tính', icon: CalculatorIcon, panelId: 'may-tinh' },
};

const ToolsContext = createContext<{
  open: State;
  setOpen: (id: ToolId, value: boolean) => void;
} | null>(null);

// chỉ tải mã của công cụ khi được mở lần đầu
const Calculator = dynamic(() => import('./Calculator'), { ssr: false });
const PeriodicTable = dynamic(() => import('./PeriodicTable'), { ssr: false });

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [open, setState] = useState<State>({ calculator: false, periodicTable: false });
  // đã mở ít nhất một lần: giữ cửa sổ trong cây để không mất phép tính đang gõ khi đóng
  const [used, setUsed] = useState<State>({ calculator: false, periodicTable: false });

  const setOpen = useCallback((id: ToolId, value: boolean) => {
    setState((s) => ({ ...s, [id]: value }));
    if (value) setUsed((u) => (u[id] ? u : { ...u, [id]: true }));
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <ToolsContext.Provider value={value}>
      {children}
      {used.periodicTable && <PeriodicTable />}
      {used.calculator && <Calculator />}
    </ToolsContext.Provider>
  );
}

export function useTool(id: ToolId) {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error('useTool cần nằm trong <ToolsProvider>');
  const { open, setOpen } = ctx;
  return {
    open: open[id],
    setOpen: (value: boolean) => setOpen(id, value),
    toggle: () => setOpen(id, !open[id]),
  };
}
