'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { AtomIcon, BackpackIcon, BookOpenIcon, ExternalLinkIcon, FlaskConicalIcon, GraduationCapIcon, SearchIcon, SigmaIcon } from 'lucide-react';
import { NavMain, type NavItem } from '@/components/nav-main';
import { TOOLS, type ToolId } from '@/components/tools-context';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  GRADES, LESSONS, classHref, getGrade, getSubject, getTopic, gradeByNo, subjectBySlug, subjectHref, subjectsOf,
  type GradeId, type SubjectId,
} from '@/lib/lessons';

/**
 * Mục lục toàn hệ thống theo block sidebar-07 của shadcn/ui (thu gọn còn dải icon).
 * Hai phần lớn:
 *  - Nội dung: Lớp (mục thu gọn được) → Môn học (trang tổng hợp của môn)
 *  - Tiện ích & công cụ: Bảng tuần hoàn, Máy tính bản toàn trang (/bang-tuan-hoan, /may-tinh) trong tab mới
 */

const GRADE_ICON: Record<GradeId, ReactNode> = {
  'lop-5': <BackpackIcon />,
  'lop-9': <GraduationCapIcon />,
};

const SUBJECT_ICON: Record<SubjectId, ReactNode> = {
  'toan-5': <SigmaIcon />,
  'vat-ly-9': <AtomIcon />,
  'hoa-hoc-9': <FlaskConicalIcon />,
};

/** Bỏ dấu tiếng Việt để tìm không cần gõ dấu */
const plain = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Công cụ bản toàn trang, mở trong tab mới (nút tròn trong bài học vẫn mở cửa sổ nổi) */
function ToolItem({ tool, href }: { tool: ToolId; href: string }) {
  const { label, icon: Icon } = TOOLS[tool];
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={`${label} (tab mới)`}>
        <a href={href} target="_blank" rel="noopener">
          <Icon />
          <span>{label}</span>
          <ExternalLinkIcon className="ml-auto opacity-50" aria-label="mở trong tab mới" />
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Lớp, môn, bài ứng với đường dẫn hiện tại */
function locate(path: string): { grade?: GradeId; subject?: SubjectId; lesson?: string } {
  const seg = path.split('/').filter(Boolean);
  if (seg[0] === 'classes') {
    const grade = gradeByNo(seg[1] ?? '');
    const subject = grade && seg[3] ? subjectBySlug(grade.id, seg[3]) : undefined;
    return { grade: grade?.id, subject: subject?.id };
  }
  const lesson = LESSONS.find((l) => l.slug === seg[0]);
  if (!lesson) return {};
  const subject = getSubject(getTopic(lesson.topic).subject);
  return { grade: subject.grade, subject: subject.id, lesson: lesson.slug };
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const path = usePathname() ?? '/';
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const here = useMemo(() => locate(path), [path]);
  const [query, setQuery] = useState('');

  // chuyển trang: đóng ngăn kéo trên điện thoại, xóa ô tìm
  useEffect(() => {
    setOpenMobile(false);
    setQuery('');
  }, [path, setOpenMobile]);

  const q = plain(query.trim());
  const hits = useMemo(
    () =>
      q
        ? LESSONS.filter((l) => {
            const t = getTopic(l.topic);
            const s = getSubject(t.subject);
            return plain(`${l.title} ${l.nav} ${l.summary} ${t.title} ${s.title} ${getGrade(s.grade).title}`).includes(q);
          })
        : [],
    [q],
  );

  const content: NavItem[] = GRADES.map((g) => ({
    title: g.title,
    url: classHref(g.id),
    icon: GRADE_ICON[g.id],
    isActive: here.grade === g.id,
    items: subjectsOf(g.id).map((s) => ({
      title: s.title,
      url: subjectHref(s.id),
      icon: SUBJECT_ICON[s.id],
      isActive: here.subject === s.id,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader data-own-keys="">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="SimBook – chọn lớp" isActive={path === '/'}>
              <Link href="/">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <BookOpenIcon className="size-4" />
                </span>
                <span className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SimBook</span>
                  <span className="truncate text-xs">Vở mô phỏng</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="relative group-data-[collapsible=icon]:hidden">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50" />
          <SidebarInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hits[0]) router.push(`/${hits[0].slug}`);
            }}
            placeholder="Tìm bài: khúc xạ, alkane…"
            aria-label="Tìm bài"
            className="pl-8"
          />
        </div>
      </SidebarHeader>

      <SidebarContent data-own-keys="">
        {q ? (
          <SidebarGroup>
            <SidebarGroupLabel>Kết quả tìm ({hits.length})</SidebarGroupLabel>
            <SidebarMenu>
              {hits.length === 0 && <p className="px-2 py-1 text-sm text-muted-foreground">Không có bài nào khớp “{query.trim()}”</p>}
              {hits.map((l) => {
                const t = getTopic(l.topic);
                const s = getSubject(t.subject);
                return (
                  <SidebarMenuItem key={l.slug}>
                    <SidebarMenuButton asChild isActive={here.lesson === l.slug} className="h-auto py-1.5">
                      <Link href={`/${l.slug}`}>
                        {SUBJECT_ICON[s.id]}
                        <span className="grid leading-tight">
                          <span>{l.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.title} {getGrade(s.grade).no} · {t.title}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <>
            <NavMain label="Nội dung" items={content} />
            <SidebarGroup>
              <SidebarGroupLabel>Tiện ích &amp; công cụ</SidebarGroupLabel>
              <SidebarMenu>
                <ToolItem tool="periodicTable" href="/bang-tuan-hoan" />
                <ToolItem tool="calculator" href="/may-tinh" />
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
