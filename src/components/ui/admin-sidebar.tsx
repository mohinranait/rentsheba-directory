"use client";
import {
  Building2,
  ChevronDown,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  MapPinned,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

type MenuItem = {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: {
    title: string;
    href: string;
    badge?: string;
  }[];
};

const mainMenu: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Listings",
    icon: Building2,
    children: [
      {
        title: "All Listings",
        href: "/admin/listings",
      },
      {
        title: "Pending Review",
        href: "/admin/listings/pending",
        badge: "12",
      },
      {
        title: "Approved",
        href: "/admin/listings/approved",
      },
      {
        title: "Rejected",
        href: "/admin/listings/rejected",
      },
      {
        title: "Featured",
        href: "/admin/listings/featured",
      },
    ],
  },
  {
    title: "Categories",
    icon: FolderTree,
    children: [
      {
        title: "All Categories",
        href: "/admin/categories",
      },
      {
        title: "Parent Categories",
        href: "/admin/categories/parents",
      },
      {
        title: "Sub Categories",
        href: "/admin/categories/subcategories",
      },
    ],
  },
  {
    title: "Locations",
    icon: MapPinned,
    children: [
      {
        title: "All Locations",
        href: "/admin/locations",
      },
      {
        title: "Divisions",
        href: "/admin/locations/divisions",
      },
      {
        title: "Districts",
        href: "/admin/locations/districts",
      },
      {
        title: "Upazilas",
        href: "/admin/locations/upazilas",
      },
    ],
  },
  {
    title: "Users",
    icon: Users,
    children: [
      {
        title: "All Users",
        href: "/admin/users",
      },
      {
        title: "Sellers",
        href: "/admin/users/sellers",
      },
      {
        title: "Admins",
        href: "/admin/users/admins",
      },
    ],
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
];

const settingsMenu: MenuItem[] = [
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "General Settings",
        href: "/admin/settings",
      },
      {
        title: "SEO",
        href: "/admin/settings/seo",
      },
      {
        title: "Email Templates",
        href: "/admin/settings/email",
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const isActive = (href?: string) => {
    if (!href) return false;

    if (href === "/admin") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-r p-0"
    >
      <SidebarHeader className="h-16 flex gap-0 items-start justify-center border-b">
        <div className="flex  items-center gap-3 px-2">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="size-5" />
            </div>

            {state === "expanded" && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">
                  Rentsheba
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Admin Panel
                </p>
              </div>
            )}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {mainMenu.map((item) => {
                if (!item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className="h-10"
                        tooltip={item.title}
                        isActive={isActive(item.href)}
                      >
                        <Link href={item.href ?? "#"} className="text-base w-full  flex gap-2 items-center">
                          <item.icon className="" />
                          <span>{item.title}</span>

                          {item.badge && (
                            <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                const hasActiveChild = item.children.some((child) =>
                  isActive(child.href),
                );

                return (
                  <Collapsible
                    key={item.title}

                    defaultOpen={hasActiveChild}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem >
                      <CollapsibleTrigger className=" w-full" >
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={hasActiveChild}
                          className="text-base w-full h-10 flex gap-2 items-center"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton
                                className="h-10"
                                isActive={isActive(child.href)}
                              >
                                <Link href={child.href} className=" text-base w-full flex gap-2 items-center">
                                  <span>{child.title}</span>

                                  {child.badge && (
                                    <span className="ml-auto rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                                      {child.badge}
                                    </span>
                                  )}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenu.map((item) => {
                const hasActiveChild = item.children?.some((child) =>
                  isActive(child.href),
                );

                return (
                  <Collapsible
                    key={item.title}

                    defaultOpen={hasActiveChild}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger >
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={hasActiveChild}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children?.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton

                                isActive={isActive(child.href)}
                              >
                                <Link href={child.href}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton

              tooltip="Admin Profile"
            >
              <Link href="/admin/profile">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    ME
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="truncate text-xs font-medium">
                    Md. Ebrahim
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    Super Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}