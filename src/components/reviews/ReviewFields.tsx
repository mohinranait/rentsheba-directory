"use client";

import { Dices, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { randomGuestName } from "@/lib/random-guest-name";
import { cn } from "@/lib/utils";

export type ReviewFieldsValue = {
  rating: number;
  text: string;
  name: string;
  anonymous: boolean;
};

const STAR_VALUES = [1, 2, 3, 4, 5];

export function ReviewFields({
  value,
  onChange,
  labelColorClass = "text-muted-foreground",
  idPrefix = "review",
  disabled = false,
}: {
  value: ReviewFieldsValue;
  onChange: (next: ReviewFieldsValue) => void;
  labelColorClass?: string;
  idPrefix?: string;
  disabled?: boolean;
}) {
  const patch = (partial: Partial<ReviewFieldsValue>) =>
    onChange({ ...value, ...partial });

  return (
    <>
      {/* Rating */}
      <div className="mt-4 flex items-center gap-1">
        <span className={cn("mr-2 text-sm font-semibold", labelColorClass)}>
          Your rating
        </span>
        {STAR_VALUES.map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => patch({ rating: star })}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star
              className={cn(
                "size-6",
                star <= value.rating
                  ? "fill-[#e5b34f] text-[#e5b34f]"
                  : "fill-[#e4e9e5] text-[#e4e9e5]",
              )}
            />
          </button>
        ))}
      </div>

      {/* Review text */}
      <div className="mt-4">
        <Textarea
          id={`${idPrefix}-text`}
          value={value.text}
          onChange={(event) => patch({ text: event.target.value })}
          placeholder="What was your experience like?"
          className="min-h-24 bg-white"
          maxLength={1000}
          disabled={disabled}
        />
        <p className="mt-1 text-right text-[11px] text-[#8aa097]">
          {value.text.length}/1000
        </p>
      </div>

      {/* Name */}
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <Label
            htmlFor={`${idPrefix}-name`}
            className={cn("text-xs font-semibold", labelColorClass)}
          >
            Name (optional)
          </Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id={`${idPrefix}-name`}
              value={value.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="Your name"
              disabled={disabled || value.anonymous}
              maxLength={80}
              className="bg-white"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                patch({ anonymous: false, name: randomGuestName() })
              }
              className="shrink-0 bg-white"
              disabled={disabled}
            >
              <Dices className="size-4" />
              Random
            </Button>
          </div>
        </div>

        <div className="flex items-end pb-1">
          <label
            htmlFor={`${idPrefix}-anonymous`}
            className={cn(
              "flex cursor-pointer items-center gap-2 text-sm font-medium",
              labelColorClass,
            )}
          >
            <Checkbox
              id={`${idPrefix}-anonymous`}
              checked={value.anonymous}
              onCheckedChange={(checked) =>
                patch({ anonymous: checked === true })
              }
              disabled={disabled}
            />
            Post anonymously
          </label>
        </div>
      </div>
    </>
  );
}
