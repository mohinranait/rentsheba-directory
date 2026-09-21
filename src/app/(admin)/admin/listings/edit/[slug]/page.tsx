"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Flag,
  MapPin,
  Pencil,
  Phone,
  Star,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type {
  AdminListingDetail,
  AdminMedia,
} from "@/app/api/admin/listing/[slug]/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DeleteListingDialog } from "../../components/delete-listing-dialog";

type ListingStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED"
  | "DRAFT";

const statusConfig: Record<
  ListingStatus,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  },
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
  },
  EXPIRED: {
    label: "Expired",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400",
  },
  DRAFT: {
    label: "Draft",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  },
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ReviewListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<AdminListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/listing/${encodeURIComponent(slug)}`);
      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: AdminListingDetail;
      };

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.message ?? "Failed to load listing");
      }

      setDetail(data.data);
      setRejectReason(data.data.rejectionReason ?? "");
    } catch {
      setError("Failed to load listing.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchReview = async (body: Record<string, unknown>) => {
    setReviewBusy(true);
    setReviewError("");

    try {
      const res = await fetch(
        `/api/admin/listing/${encodeURIComponent(slug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      const data = (await res.json()) as { success: boolean; message?: string };

      if (!data.success) {
        setReviewError(data.message ?? "Update failed");
        return;
      }

      void load();
    } catch {
      setReviewError("Update failed");
    } finally {
      setReviewBusy(false);
    }
  };

  const handleApprove = () => patchReview({ verificationStatus: "APPROVED" });

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setReviewError("Rejection reason is required");
      return;
    }
    patchReview({
      verificationStatus: "REJECTED",
      rejectionReason: rejectReason.trim(),
    });
  };

  const handleSetPending = () => patchReview({ verificationStatus: "PENDING" });

  const handleToggleFeatured = (checked: boolean) =>
    patchReview({ isFeatured: checked });

  const handleToggleClaimed = (checked: boolean) =>
    patchReview({ isClaimed: checked });

  if (loading) {
    return <ReviewSkeleton />;
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  const status =
    statusConfig[detail.verificationStatus] ?? statusConfig.PENDING;
  const features =
    (detail.features as { type?: string; name?: string }[] | null) ?? [];
  const faqs =
    (detail.faqs as { question?: string; answer?: string }[] | null) ?? [];
  const socialLinks =
    (detail.socialLinks as Record<string, string | null | undefined> | null) ??
    {};
  const openingHours =
    (detail.openingHours as
      | {
        day?: string;
        isClosed?: boolean;
        openTime?: string;
        closeTime?: string;
      }[]
      | null) ?? [];

  return (
    <div className=" max-w-5xl flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit"
            render={<Link href="/admin/listings" />}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to listings
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {detail.title}
            </h1>

            <Badge variant="outline" className={status.className}>
              <span className="mr-1.5 size-1.5 rounded-full bg-current" />
              {status.label}
            </Badge>

            {detail.isFeatured && <Badge variant="secondary">Featured</Badge>}
          </div>

          <p className="text-sm text-muted-foreground">/{detail.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/listings/add?slug=${detail.slug}`} />}
          >
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/listing/${detail.slug}`} target="_blank" />}
          >
            View live
            <ExternalLink className="ml-1.5 size-3.5" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1.5 size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status review panel */}
     
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Review Status</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Current status:</span>{" "}
                <span className="font-medium">{status.label}</span>
              </p>

              {detail.verifiedAt && (
                <p className="text-muted-foreground">
                  Verified {dateFormatter.format(new Date(detail.verifiedAt))}
                </p>
              )}

              {detail.publishedAt && (
                <p className="text-muted-foreground">
                  Published {dateFormatter.format(new Date(detail.publishedAt))}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={
                  detail.verificationStatus === "APPROVED"
                    ? "default"
                    : "outline"
                }
                disabled={
                  reviewBusy || detail.verificationStatus === "APPROVED"
                }
                onClick={handleApprove}
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                Approve
              </Button>

              <Button
                size="sm"
                variant="destructive"
                disabled={reviewBusy}
                onClick={() => patchReview({ verificationStatus: "SUSPENDED" })}
              >
                Suspend
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={reviewBusy || detail.verificationStatus === "PENDING"}
                onClick={handleSetPending}
              >
                Set pending
              </Button>
            </div>
          </div>

          <Separator />

          {/* Reject with reason */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Rejection reason</p>

            {detail.rejectionReason && (
              <p className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {detail.rejectionReason}
              </p>
            )}

            <Textarea
              rows={3}
              placeholder="Explain why this listing should be rejected…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <Button
              size="sm"
              variant="destructive"
              disabled={reviewBusy || !rejectReason.trim()}
              onClick={handleReject}
            >
              Reject listing
            </Button>
          </div>

          {reviewError && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {reviewError}
            </p>
          )}

          <Separator />

          {/* Feature / claimed toggles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Featured listing</p>
                <p className="text-xs text-muted-foreground">
                  Appears on the homepage and in promoted sections
                </p>
              </div>

              <Switch
                checked={detail.isFeatured}
                onCheckedChange={handleToggleFeatured}
                disabled={reviewBusy}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Claimed by owner</p>
                <p className="text-xs text-muted-foreground">
                  Owner has verified and claimed this listing
                </p>
              </div>

              <Switch
                checked={detail.isClaimed}
                onCheckedChange={handleToggleClaimed}
                disabled={reviewBusy}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Show on homepage</p>
                <p className="text-xs text-muted-foreground">
                  Appears in the hero section at the top of the home page
                </p>
              </div>

              <Switch
                checked={detail.isHeroListing}
                onCheckedChange={(checked) =>
                  patchReview({ isHeroListing: checked })
                }
                disabled={reviewBusy}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      {(detail.thumbnail || detail.logo || detail.gallery.length > 0) && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Images</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {detail.thumbnail && (
                <ImageBlock
                  label="Cover / Thumbnail"
                  media={detail.thumbnail}
                />
              )}

              {detail.logo && <ImageBlock label="Logo" media={detail.logo} />}
            </div>

            {detail.gallery.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Gallery ({detail.gallery.length})
                </p>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {detail.gallery.map((media) => (
                    <div
                      key={media.id}
                      className="aspect-square overflow-hidden rounded-lg border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.secure_url}
                        alt={media.alt ?? ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column – details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {detail.shortDescription && (
                <p className="text-sm text-muted-foreground">
                  {detail.shortDescription}
                </p>
              )}

              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {detail.description}
                </p>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <InfoRow label="Category" value={detail.category?.name} />
                <InfoRow label="Location" value={detail.location?.nameLocal} />
                <InfoRow
                  label="Established"
                  value={
                    detail.establishedYear
                      ? String(detail.establishedYear)
                      : undefined
                  }
                />
                <InfoRow label="Price range" value={detail.priceRange} />
                <InfoRow label="Area served" value={detail.areaServed} />
                <InfoRow
                  label="Owner"
                  value={
                    detail.owner
                      ? `${detail.owner.name} (${detail.owner.email})`
                      : undefined
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoRow
                icon={<Phone className="size-4" />}
                label="Phone"
                value={detail.phone}
              />
              <InfoRow
                icon={<Phone className="size-4" />}
                label="WhatsApp"
                value={detail.whatsapp}
              />
              <InfoRow label="Email" value={detail.email} />
              <InfoRow
                label="Website"
                value={detail.website}
                link={detail.website ?? undefined}
              />
            </CardContent>
          </Card>

          {/* Social links */}
          {Object.values(socialLinks).some(Boolean) && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Social Links</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                {(
                  [
                    "facebook",
                    "instagram",
                    "youtube",
                    "linkedin",
                    "tiktok",
                  ] as const
                ).map((key) =>
                  socialLinks[key] ? (
                    <InfoRow
                      key={key}
                      label={key}
                      value={socialLinks[key]!}
                      link={socialLinks[key]!}
                    />
                  ) : null,
                )}
              </CardContent>
            </Card>
          )}

          {/* Description (full) */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Opening Hours</CardTitle>
            </CardHeader>

            <CardContent>
              {openingHours.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not provided</p>
              ) : (
                <div className="space-y-1 text-sm">
                  {openingHours.map((row, index) => (
                    <div
                      key={row.day ?? index}
                      className="flex items-center justify-between border-b py-1.5 last:border-0"
                    >
                      <span className="font-medium">
                        {DAY_LABELS[row.day ?? ""] ?? row.day}
                      </span>

                      <span className="text-muted-foreground">
                        {row.isClosed
                          ? "Closed"
                          : `${row.openTime} – ${row.closeTime}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column – features, FAQs, stats, address */}
        <div className="space-y-6">
          {/* Address */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4" />
                Address
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              {detail.addressLine1 ?? "Not provided"}
              {detail.location && (
                <p className="mt-1">
                  {detail.location.nameLocal} ({detail.location.nameEn})
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Stats</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <StatRow
                label="Views"
                value={detail.viewCount.toLocaleString()}
              />
              <StatRow
                label="Favorites"
                value={detail.favoriteCount.toLocaleString()}
              />
              <StatRow
                label="Rating"
                value={
                  detail.reviewCount > 0
                    ? `${detail.averageRating.toFixed(1)} (${detail.reviewCount} reviews)`
                    : "No reviews yet"
                }
                icon={<Star className="size-3.5" />}
              />
            </CardContent>
          </Card>

          {/* Features */}
          {features.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Features</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Badge
                    key={feature.name ?? "feature"}
                    variant="secondary"
                    className="text-xs"
                  >
                    {feature.type === "AMENITY" ? "✨" : "🔧"}{" "}
                    {feature.name ?? "—"}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">FAQs</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.question ?? "faq"}>
                    <p className="text-sm font-medium">{faq.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Flags & metadata */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <InfoRow
                label="Created"
                value={dateFormatter.format(new Date(detail.createdAt))}
              />
              <InfoRow
                label="Updated"
                value={dateFormatter.format(new Date(detail.updatedAt))}
              />
              <InfoRow
                label="Published"
                value={
                  detail.publishedAt
                    ? dateFormatter.format(new Date(detail.publishedAt))
                    : "Not published"
                }
              />
              <InfoRow label="Slug" value={detail.slug} />
              <InfoRow label="ID" value={detail.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteListingDialog
        open={deleteOpen}
        listingTitle={detail.title}
        listingSlug={detail.slug}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}

function ImageBlock({ label, media }: { label: string; media: AdminMedia }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>

      <div className="relative overflow-hidden rounded-lg border">
        <img
          src={media.secure_url}
          alt={media.alt ?? label}
          className="aspect-[16/6] w-full object-cover"
        />
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  link,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
  link?: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}

      <div>
        <p className="text-xs text-muted-foreground">{label}</p>

        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>

      <span className="font-medium">{value}</span>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <Skeleton className="h-52 rounded-xl" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
