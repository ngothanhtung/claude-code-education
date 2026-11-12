'use client';

import Link from 'next/link';
import { BookOpenIcon, ChevronsUpDownIcon, GraduationCapIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { GRADES, classHref, subjectsOf, type GradeId } from '@/lib/lessons';

/** Đầu sidebar: tên hệ thống + lớp đang xem; menu chọn lớp (thay cho TeamSwitcher của sidebar-07) */
export function GradeSwitcher({ grade, onChange }: { grade: GradeId; onChange: (g: GradeId) => void }) {
  const { isMobile } = useSidebar();
  const current = GRADES.find((g) => g.id === grade)!;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={`Vở mô phỏng – ${current.title}`}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpenIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Vở mô phỏng</span>
                <span className="truncate text-xs">
                  {current.title} · {current.level}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-own-keys="" className="min-w-56 rounded-lg" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Chọn lớp</DropdownMenuLabel>
            {GRADES.map((g) => (
              <DropdownMenuItem key={g.id} onClick={() => onChange(g.id)} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <GraduationCapIcon className="size-3.5" />
                </div>
                <div className="grid leading-tight">
                  <span className="font-medium">{g.title}</span>
                  <span className="text-xs text-muted-foreground">{subjectsOf(g.id).map((s) => s.title).join(', ')}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link href={classHref(grade)}>Mở trang {current.title}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
