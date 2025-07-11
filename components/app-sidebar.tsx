"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import {
  IconCookie,
  IconCompass,
  IconDashboard,
  IconListDetails,
  IconUsers,
  IconBuilding,
  IconChartHistogram,
  IconTarget,
  IconCashRegister,
  IconTruckDelivery,
  IconDatabase,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useUser } from "@/app/providers/UserProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "ダッシュボード",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "売上目標",
    url: "/dashboard/targets",
    icon: IconTarget,
  },
  {
    title: "売上分析",
    url: "/dashboard/analytics",
    icon: IconChartHistogram,
  },
  {
    title: "商品別実績",
    url: "/dashboard/products-sales",
    icon: IconListDetails,
  },
  {
    title: "レジ記録一覧",
    url: "/dashboard/register-close",
    icon: IconCashRegister,
  },
  {
    title: "発注管理",
    url: "/dashboard/orders",
    icon: IconTruckDelivery,
  },
  {
    title: "商品一覧",
    url: "/dashboard/products",
    icon: IconCookie,
  },
  {
    title: "商品管理",
    url: "/dashboard/items",
    icon: IconCookie,
  },
  {
    title: "店舗管理",
    url: "/stores",
    icon: IconBuilding,
  },
  {
    title: "ユーザー管理",
    url: "/",
    icon: IconUsers,
  },
  {
    title: "ER図",
    url: "/erd",
    icon: IconDatabase,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { user } = useUser();

  const userData = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
    role: user?.role || "",
    store: user?.store?.name || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconCompass className="!size-5" />
                <span className="text-base font-semibold">Quonpass</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
