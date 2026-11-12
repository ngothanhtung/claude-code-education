'use client';

import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Nút tròn chỉ có icon trong `.tool-dock` (Máy tính, Bảng tuần hoàn); tên công cụ hiện trong tooltip của shadcn/ui
 * khi rê chuột hoặc focus bằng bàn phím, và đọc được qua aria-label.
 */
export default function ToolToggle({
  label,
  icon,
  open,
  controls,
  onToggle,
}: {
  label: string;
  icon: ReactNode;
  open: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="tool-toggle"
          aria-label={label}
          aria-expanded={open}
          aria-controls={controls}
          onClick={onToggle}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {open ? `Đóng ${label.toLowerCase()}` : label}
      </TooltipContent>
    </Tooltip>
  );
}
