import { Building2, CreditCard, FolderTree, LayoutDashboard, Mail, MapPinned, Settings, Users } from "lucide-react";

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
    icon: CreditCard,
    children: [
      {
        title: "All Subscriptions",
        href: "/admin/subscriptions",
      },
      {
        title: "Subscription Plans",
        href: "/admin/subscription-plan",
      },
    ],
  },
  {
    title: "Messages",
    href: "/admin/contacts",
    icon: Mail,
  },
];

export const settingsMenu: MenuItem[] = [
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "General & Branding",
        href: "/admin/settings",
      },
      {
        title: "Contact & Social",
        href: "/admin/settings?tab=contact",
      },
      {
        title: "SEO & Analytics",
        href: "/admin/settings?tab=seo",
      },
      {
        title: "Email / SMTP",
        href: "/admin/settings?tab=email",
      },
      {
        title: "Media & Storage",
        href: "/admin/settings?tab=media",
      },
      {
        title: "Map & System",
        href: "/admin/settings?tab=map",
      },
    ],
  },
];