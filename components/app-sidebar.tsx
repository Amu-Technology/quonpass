"use client";

import { useSession } from "next-auth/react";
import * as React from "react";
import {

  IconChartBar,
  IconCompass,
  IconDashboard,

  IconFolder,

  IconListDetails,

  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "ダッシュボード",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "売上目標",
      url: "/sales-target",
      icon: IconListDetails,
    },
    {
      title: "発注管理",
      url: "/order",
      icon: IconChartBar,
    },
    {
      title: "設定",
      url: "/settings",
      icon: IconFolder,
    },
    {
      title: "ユーザー管理",
      url: "/user-management",
      icon: IconUsers,
    },
  ],
  
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  data.user.name = session?.user?.name || "";
  data.user.email = session?.user?.email || "";
  data.user.avatar = session?.user?.image || "";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconCompass className="!size-5" />
                <span className="text-base font-semibold">Qompass</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
