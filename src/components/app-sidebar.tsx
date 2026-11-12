'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import {
  AtomIcon, CarIcon, FlaskConicalIcon, FuelIcon, GaugeIcon, HammerIcon, HouseIcon, LightbulbIcon, MountainIcon,
  RulerIcon, SearchIcon, SigmaIcon, WheatIcon, WineIcon, ZapIcon,
} from 'lucide-react';
import { GradeSwitcher } from '@/components/grade-switcher';
import { NavMain, type NavTopic } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  GRADES, LESSONS, getGrade, getSubject, getTopic, gradeByNo, lessonsOf, subjectBySlug, subjectHref, subjectsOf, topicHref,
  topicsOf, type GradeId, type SubjectId, type TopicId,
} from '@/lib/lessons';

/**
 * Mục lục toàn hệ thống theo block sidebar-07 của shadcn/ui (thu gọn còn dải icon).
 * Dữ liệu lấy từ lib/lessons.ts: Lớp (menu đầu) → Môn (nhóm) → Chủ đề (mục thu gọn được) → Bài.
 */

const TOPIC_ICON: Record<TopicId, ReactNode> = {
  'chuyen-dong': <CarIcon />,
  'do-luong': <RulerIcon />,
  'nang-luong-co-hoc': <GaugeIcon />,
  'quang-hoc': <LightbulbIcon />,
  'dien-hoc': <ZapIcon />,
  'kim-loai': <HammerIcon />,
  hydrocarbon: <FuelIcon />,
  'ruou-axit': <WineIcon />,
  'hop-chat-thien-nhien': <WheatIcon />,
  'vo-trai-dat': <MountainIcon />,
};

const SUBJECT_ICON: Record<SubjectId, ReactNode> = {
  'toan-5': <SigmaIcon />,
  'vat-ly-9': <AtomIcon />,
  'hoa-hoc-9': <FlaskConicalIcon />,
};

/** Bỏ dấu tiếng Việt để tìm không cần gõ dấu */
const plain = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Lớp, môn, chủ đề, bài ứng với đường dẫn hiện tại */
function locate(path: string): { grade?: GradeId; subject?: SubjectId; topic?: TopicId; lesson?: string } {
  const seg = path.split('/').filter(Boolean);
  if (seg[0] === 'classes') {
    const grade = gradeByNo(seg[1] ?? '');
    const subject = grade && seg[3] ? subjectBySlug(grade.id, seg[3]) : undefined;
    const topic = subject && seg[4] === 'topics' ? topicsOf(subject.id).find((t) => t.id === seg[5]) : undefined;
    return { grade: grade?.id, subject: subject?.id, topic: topic?.id };
  }
  const lesson = LESSONS.find((l) => l.slug === seg[0]);
  if (!lesson) return {};
  const topic = getTopic(lesson.topic);
  const subject = getSubject(topic.subject);
  return { grade: subject.grade, subject: subject.id, topic: topic.id, lesson: lesson.slug };
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const path = usePathname() ?? '/';
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const here = useMemo(() => locate(path), [path]);
  const [grade, setGrade] = useState<GradeId>(here.grade ?? GRADES[GRADES.length - 1].id);
  const [query, setQuery] = useState('');

  // chuyển trang: lớp theo trang mới, đóng ngăn kéo trên điện thoại, xóa ô tìm
  useEffect(() => {
    if (here.grade) setGrade(here.grade);
    setOpenMobile(false);
    setQuery('');
  }, [path, here.grade, setOpenMobile]);

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

  const navOf = (subject: SubjectId): NavTopic[] =>
    topicsOf(subject).map((t) => ({
      title: t.title,
      url: topicHref(t.id),
      icon: TOPIC_ICON[t.id],
      isActive: here.topic === t.id,
      items: lessonsOf(t.id).map((l) => ({ title: l.title, url: `/${l.slug}`, isActive: here.lesson === l.slug })),
    }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader data-own-keys="">
        <GradeSwitcher grade={grade} onChange={setGrade} />
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
                        {TOPIC_ICON[t.id]}
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
            {subjectsOf(grade).map((s) => (
              <NavMain key={s.id} label={`${s.title} ${getGrade(grade).no}`} items={navOf(s.id)} />
            ))}
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>Trang tổng hợp</SidebarGroupLabel>
              <SidebarMenu>
                {subjectsOf(grade).map((s) => (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton asChild isActive={here.subject === s.id && !here.topic}>
                      <Link href={subjectHref(s.id)}>
                        {SUBJECT_ICON[s.id]}
                        <span>
                          {s.title} {getGrade(grade).no}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter data-own-keys="">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Tất cả các lớp" isActive={path === '/'}>
              <Link href="/">
                <HouseIcon />
                <span>Tất cả các lớp</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
