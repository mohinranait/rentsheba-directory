import { Building2, CreditCard, FolderTree, LayoutDashboard, MapPinned, Settings, Users } from "lucide-react";

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

export const mainMenu: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
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
        title: "Listing Reviews",
        href: "/admin/listing-reviews",
      },
      {
        title: "Pending Review",
        href: "/admin/listings/pending",
        // badge: "12",
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
    ],
  },
  {
    title: "Locations",
    icon: MapPinned,
    children: [
      {
        title: "Divisions",
        href: "/admin/divisions",
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
    href: "/admin/subscription-plan",
    icon: CreditCard,
  },
];

export const settingsMenu: MenuItem[] = [
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