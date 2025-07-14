"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import {
  IconCookie,
  IconCompass,
  IconHelp,
  IconListDetails,
  IconUsers,
  IconBuilding,
  IconChartHistogram,
  IconTarget,
  IconCashRegister,
  IconTruckDelivery,
  IconDatabase,
  IconChefHat,
  IconFileText,
  IconApi,
  IconBug,
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

const navGroups = [
  {
    title: "予実管理",
    items: [
      {
        title: "売上目標設定",
        url: "/dashboard/targets",
        icon: IconTarget,
      },
      {
        title: "売上分析",
        url: "/dashboard/analytics",
        icon: IconChartHistogram,
      },
      {
        title: "レジ記録登録",
        url: "/dashboard/register-close",
        icon: IconCashRegister,
      },
      {
        title: "商品別実績",
        url: "/dashboard/products-sales",
        icon: IconListDetails,
      },
      {
        title: "商品一覧",
        url: "/dashboard/products",
        icon: IconCookie,
      },
    ],
  },
  {
    title: "発注管理",
    items: [
      {
        title: "発注登録",
        url: "/dashboard/orders",
        icon: IconTruckDelivery,
      },
      {
        title: "発注履歴",
        url: "/dashboard/orders/history",
        icon: IconFileText,
      },
      {
        title: "発注商品一覧",
        url: "/dashboard/items",
        icon: IconCookie,
      },
      {
        title: "レシピ管理",
        url: "/dashboard/recipes",
        icon: IconChefHat,
      },
    ],
  },
  {
    title: "全般設定",
    items: [
      {
        title: "店舗管理",
        url: "/stores",
        icon: IconBuilding,
      },
      {
        title: "ユーザー管理",
        url: "/dashboard/users",
        icon: IconUsers,
      },
      {
        title: "ER図",
        url: "/erd",
        icon: IconDatabase,
      },
      {
        title: "Open API Docs",
        url: "/api-docs",
        icon: IconApi,
      },
      {
        title: "ヘルプ",
        url: "/help",
        icon: IconHelp,
      },
      {
        title: "不具合報告",
        url: "https://forms.gle/p2LYzcbToVBKe8H98",
        icon: IconBug,
      },
    ],
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
                <span className="text-base font-semibold">QuonPass</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
