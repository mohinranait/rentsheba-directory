
import { Star } from "lucide-react";
import type { PublicListingDetail } from "@/lib/public-listing";
import { cn } from "@/lib/utils";
import ReviewForm from "./ReviewForm";

type ReviewItem = {
  id: string;
  rating: number;
  text: string;
  name: string | null;
  createdAt: string;
};

type ReviewsSectionProps = {
  listing: PublicListingDetail;
  slug: string;
  initialReviews: ReviewItem[];
  initialAverageRating: number;
  initialReviewCount: number;
};

const STAR_VALUES = [1, 2, 3, 4, 5];

const AVATAR_TONES = [
  "bg-[#e7f0eb] text-[#2e6c57]",
  "bg-[#f1e9dc] text-[#8a5a2b]",
  "bg-[#e3eaf3] text-[#335b7a]",
  "bg-[#f6e7e2] text-[#9c4a35]",
  "bg-[#e7ecf0] text-[#4a5b68]",
];

const getTone = (value: string) => {
  const hash = value
    .split("")
    .reduce((sum, char) => sum + (char.charCodeAt(0) ?? 0), 0);
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

const getInitial = (name: string | null) => {
  const source = name?.trim() ? name : "Anonymous";
  return source.charAt(0).toUpperCase();
};

const displayName = (name: string | null) =>
  name?.trim() ? name : "Anonymous";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Stars({ value }: { value: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {STAR_VALUES.map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            star <= value
              ? "fill-[#e5b34f] text-[#e5b34f]"
              : "fill-[#e8ecea] text-[#e8ecea]",
          )}
        />
      ))}
    </span>
  );
}

export default function ReviewsSection({
  listing,
  slug,

}: ReviewsSectionProps) {


  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
            Customer reviews
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
            What people are saying
          </h2>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-2xl font-bold text-[#254d40]">
            <Star className="size-5 fill-[#e5b34f] text-[#e5b34f]" />{" "}
            {listing?.averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-[#80958c]">
            {listing?.reviewCount > 0
              ? `${listing?.reviewCount} review${listing?.reviewCount === 1 ? "" : "s"}`
              : "No reviews yet"}
          </p>
        </div>
      </div>

      {/* Summary / list */}
      <div className="mt-7 flex flex-col gap-5">
        {listing?.reviewCount > 0 ? (
          <div className="border-t border-[#edf1ee] pt-5 text-sm leading-7 text-[#657d74]">
            This business has earned{" "}
            <strong className="font-bold text-[#31594c]">
              {listing?.averageRating.toFixed(1)} out of 5
            </strong>{" "}
            from {listing?.reviewCount} review{listing?.reviewCount === 1 ? "" : "s"} on
            directory.
          </div>
        ) : (
          <div className="border-t border-[#edf1ee] pt-5 text-sm leading-7 text-[#657d74]">
            No customer reviews yet. Reviews from customers will appear here
            after an admin approves them.
          </div>
        )}

        {listing?.reviews.length > 0 && (
          <ul className="flex flex-col gap-5">
            {listing?.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border border-[#e4ece6] bg-[#fafcfa] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold shadow-sm",
                        getTone(review.name ?? "Anonymous"),
                      )}
                      aria-hidden
                    >
                      {getInitial(review.name)}
                    </span>
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold text-[#254d40]">
                        {displayName(review.name)}
                        {review.name ? null : (
                          <span className="rounded-full bg-[#edf3ef] px-2 py-0.5 text-[10px] font-bold text-[#5d8172]">
                            Anonymous
                          </span>
                        )}
                      </p>
                      <Stars value={review.rating} />
                    </div>
                  </div>
                  <time className="shrink-0 text-xs text-[#8aa097]">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#5c756b]">
                  {review.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit a review */}
      <div className="mt-8 rounded-2xl border border-[#e0e9e3] bg-[#f7faf7] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
          Share your experience
        </p>
        <h3 className="mt-2 text-lg font-bold tracking-[-.02em] text-[#173f34]">
          Write a review for this business
        </h3>

        <ReviewForm slug={slug} />
        <p className="mt-3 text-[11px] leading-5 text-[#8aa097]">
          Your review is submitted for admin approval before it is published.
        </p>
      </div>
    </div>
  );
}
