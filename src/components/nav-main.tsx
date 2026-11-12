'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export interface NavItem {
  title: string;
  url: string;
  icon: ReactNode;
  /** chứa trang đang xem: mở sẵn */
  isActive?: boolean;
  items: { title: string; url: string; icon?: ReactNode; isActive?: boolean }[];
}

/** Phần "Nội dung": mỗi lớp là một mục thu gọn được, mở ra là các môn học (theo block sidebar-07 của shadcn/ui) */
export function NavMain({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.url} asChild defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} isActive={item.isActive} className="h-auto min-h-8">
                  {item.icon}
                  <span className="leading-snug">{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((sub) => (
                    <SidebarMenuSubItem key={sub.url}>
                      <SidebarMenuSubButton asChild isActive={sub.isActive} className="h-auto min-h-7 py-1 [&>span:last-child]:whitespace-normal">
                        <Link href={sub.url} aria-current={sub.isActive ? 'page' : undefined}>
                          {sub.icon}
                          <span>{sub.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
