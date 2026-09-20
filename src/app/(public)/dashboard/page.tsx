import {
  ArrowRight,
  Building2,
  Clock3,
  Pencil,
  Plus,
  Star,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";
import { ListingStatus } from "../../../../generated/prisma/enums";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ListingStatus, string> = {
  [ListingStatus.PENDING]: "Pending review",
  [ListingStatus.APPROVED]: "Approved",
  [ListingStatus.REJECTED]: "Rejected",
  [ListingStatus.SUSPENDED]: "Suspended",
  [ListingStatus.EXPIRED]: "Expired",
  [ListingStatus.DRAFT]: "Draft",
};

const STATUS_STYLE: Record<ListingStatus, string> = {
  [ListingStatus.PENDING]: "bg-[#fdf3de] text-[#9a6a16]",
  [ListingStatus.APPROVED]: "bg-[#e4f3e9] text-[#2f7a52]",
  [ListingStatus.REJECTED]: "bg-[#fdeaea] text-[#b0523f]",
  [ListingStatus.SUSPENDED]: "bg-[#fdeaea] text-[#b0523f]",
  [ListingStatus.EXPIRED]: "bg-[#f0f0f0] text-[#6b7a72]",
  [ListingStatus.DRAFT]: "bg-[#f0f0f0] text-[#6b7a72]",
};

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function DashboardPage() {
  const session = await getSessionUser();

  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      listings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          verificationStatus: true,
          createdAt: true,
          viewCount: true,
          averageRating: true,
          reviewCount: true,
          isFeatured: true,
        },
      },
    },
  });

  const listings = user?.listings ?? [];
  const totalViews = listings.reduce((sum, item) => sum + item.viewCount, 0);
  const rated = listings.filter((item) => item.reviewCount > 0);
  const averageRating =
    rated.length > 0
      ? (
          rated.reduce(
            (sum, item) => sum + item.averageRating * item.reviewCount,
            0,
          ) / rated.reduce((sum, item) => sum + item.reviewCount, 0)
        ).toFixed(1)
      : "—";

  const stats = [
    {
      label: "Total listings",
      value: String(listings.length),
      icon: Building2,
    },
    {
      label: "Total views",
      value: totalViews.toLocaleString("en-US"),
      icon: Clock3,
    },
    {
      label: "Average rating",
      value: averageRating,
      icon: Star,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">
            Welcome back, {user?.name?.split(/\s+/)[0] ?? "friend"} 👋
          </h1>
          <p className="mt-2 text-sm text-[#647f74]">
            {user?.email} · Manage your business listings from one place.
          </p>
        </div>
        <Link
          href="/listing/add"
          className="inline-flex items-center gap-2 rounded-xl bg-[#133f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d5548]"
        >
          <Plus className="size-4" /> Add new listing
        </Link>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-[#e1e9e3] bg-white p-5"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[#edf5ef] text-[#4b8b71]">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold tracking-tight text-[#254d40]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#7d9289]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
              My listings
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
              Your business pages
            </h2>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {listings.length > 0 ? (
            listings.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-[#e1e9e3] bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-[#254b3f]">
                      {item.title}
                    </h3>
                    {item.isFeatured && (
                      <span className="rounded-full bg-[#edf7ef] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4b8b71]">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#82968d]">
                    {formatDate(item.createdAt)} · {item.verificationStatus}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[item.verificationStatus]}`}
                >
                  {STATUS_LABEL[item.verificationStatus]}
                </span>
                <div className="flex items-center gap-4 text-xs text-[#6d857b]">
                  <span className="flex items-center gap-1">
                    <Clock3 className="size-3.5 text-[#4b8b71]" />{" "}
                    {item.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 fill-[#e5b34f] text-[#e5b34f]" />{" "}
                    {item.averageRating.toFixed(1)}
                  </span>
                  <Link
                    href={`/listing/${item.slug}/edit`}
                    className="inline-flex items-center gap-1 font-bold text-[#36705e] hover:text-[#133f35]"
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Link>
                  <Link
                    href={`/listing/${item.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#36705e] hover:text-[#133f35]"
                  >
                    View <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cbdcd1] bg-white/40 p-10 text-center">
              <p className="text-sm font-semibold text-[#31594c]">
                No listings yet
              </p>
              <p className="mt-1 text-sm text-[#7d9289]">
                Add your first business listing — it&apos;s free.
              </p>
              <Link
                href="/listing/add"
                className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-[#133f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d5548]"
              >
                <Plus className="size-4" /> Add your listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
