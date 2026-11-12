'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TOOLS, useTool, type ToolId } from './tools-context';

/**
 * Nút tròn chỉ có icon trong `.tool-dock` (Máy tính, Bảng tuần hoàn); tên công cụ hiện trong tooltip của shadcn/ui
 * khi rê chuột hoặc focus bằng bàn phím, và đọc được qua aria-label. Cùng trạng thái mở với mục trong sidebar.
 */
export default function ToolToggle({ tool }: { tool: ToolId }) {
  const { open, toggle } = useTool(tool);
  const { label, icon: Icon, panelId } = TOOLS[tool];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="tool-toggle"
          aria-label={label}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <Icon aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {open ? `Đóng ${label.toLowerCase()}` : label}
      </TooltipContent>
    </Tooltip>
  );
}
