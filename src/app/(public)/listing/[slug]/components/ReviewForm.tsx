"use client";
import { cn } from "cn";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import React, { useState } from "react";
import {
  ReviewFields,
  type ReviewFieldsValue,
} from "@/components/reviews/ReviewFields";
import { Button } from "@/components/ui/button";

const DEFAULT_FIELDS: ReviewFieldsValue = {
  rating: 5,
  text: "",
  name: "",
  anonymous: false,
};

type Props = {
  slug: string;
};
const ReviewForm = ({ slug }: Props) => {
  const [fields, setFields] = useState<ReviewFieldsValue>(DEFAULT_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const resetMessage = () => setMessage(null);

  const handleSubmit = async () => {
    if (submitting) return;
    resetMessage();

    if (
      !Number.isInteger(fields.rating) ||
      fields.rating < 1 ||
      fields.rating > 5
    ) {
      setMessage({ type: "error", text: "Please pick a star rating." });
      return;
    }

    if (!fields.text.trim()) {
      setMessage({ type: "error", text: "Please write a short review." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/public/listing/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: fields.rating,
          text: fields.text.trim(),
          name: fields.name.trim(),
          anonymous: fields.anonymous,
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

      setFields(DEFAULT_FIELDS);
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
      <ReviewFields
        value={fields}
        onChange={(next) => {
          setFields(next);
          resetMessage();
        }}
        labelColorClass="text-[#527268]"
        idPrefix="review"
      />

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
  );
};

export default ReviewForm;
