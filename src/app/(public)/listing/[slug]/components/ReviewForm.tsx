'use client';
import { cn } from 'cn';
import { CheckCircle2, Dices, Loader2, Send, Star } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { randomGuestName } from '@/lib/random-guest-name';



const STAR_VALUES = [1, 2, 3, 4, 5];

type Props = {
  slug: string;
}
const ReviewForm = ({ slug }: Props) => {

  //  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  // const [averageRating, setAverageRating] = useState(initialAverageRating);
  // const [reviewCount, setReviewCount] = useState(initialReviewCount);
  // const [loading, setLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Refresh the published reviews on mount so the list is never stale even
  // when the server page is cached by ISR.
  // useEffect(() => {
  //   let cancelled = false;

  //   const load = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(`/api/public/listing/${slug}/reviews`, {
  //         cache: "no-store",
  //       });
  //       const data = await response.json();

  //       if (!cancelled && data.success && data.data) {
  //         setReviews(data.data.reviews as ReviewItem[]);
  //         setAverageRating(data.data.averageRating as number);
  //         setReviewCount(data.data.reviewCount as number);
  //       }
  //     } catch {
  //       // Keep the server-rendered data on failure.
  //     } finally {
  //       if (!cancelled) setLoading(false);
  //     }
  //   };

  //   void load();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [slug]);

  const resetMessage = () => setMessage(null);

  const handleRandomName = () => {
    setAnonymous(false);
    setName(randomGuestName());
    resetMessage();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    resetMessage();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage({ type: "error", text: "Please pick a star rating." });
      return;
    }

    if (!text.trim()) {
      setMessage({ type: "error", text: "Please write a short review." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/public/listing/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          text: text.trim(),
          name: name.trim(),
          anonymous,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage({
          type: "error",
          text: data.message ?? "Could not submit your review.",
        });
        return;
      }

      setText("");
      setRating(5);
      setAnonymous(false);
      setName("");
      setMessage({
        type: "success",
        text: data.message ?? "Thanks for your review!",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <div className="mt-4 flex items-center gap-1">
        <span className="mr-2 text-sm font-semibold text-[#527268]">
          Your rating
        </span>
        {STAR_VALUES.map((star) => {
          const starValue = star;
          return (
            <button
              key={star}
              type="button"
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              onClick={() => {
                setRating(starValue);
                resetMessage();
              }}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-6",
                  starValue <= rating
                    ? "fill-[#e5b34f] text-[#e5b34f]"
                    : "fill-[#e4e9e5] text-[#e4e9e5]",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            resetMessage();
          }}
          placeholder="What was your experience like?"
          className="min-h-24 bg-white"
          maxLength={1000}
        />
        <p className="mt-1 text-right text-[11px] text-[#8aa097]">
          {text.length}/1000
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <Label
            htmlFor="reviewer-name"
            className="text-xs font-semibold text-[#527268]"
          >
            Name (optional)
          </Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="reviewer-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                resetMessage();
              }}
              placeholder="Your name"
              disabled={anonymous}
              maxLength={80}
              className="bg-white"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleRandomName}
              className="shrink-0 bg-white"
            >
              <Dices className="size-4" />
              Random
            </Button>
          </div>
        </div>

        <div className="flex items-end pb-1">
          <label
            htmlFor="review-anonymous"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#527268]"
          >
            <Checkbox
              id="review-anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => {
                setAnonymous(checked === true);
                resetMessage();
              }}
            />
            Post anonymously
          </label>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium",
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700",
          )}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : null}
          {message.text}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 rounded-xl bg-[#133f35] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f352d]"
      >
        {submitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Send className="mr-2 size-4" />
        )}
        {submitting ? "Submitting…" : "Submit review"}
      </Button>

    </React.Fragment>
  )
}

export default ReviewForm