"use client";

import { Loader2, Plus, Save, Star } from "lucide-react";
import * as React from "react";
import Modal from "@/components/common/Modal";
import {
  ReviewFields,
  type ReviewFieldsValue,
} from "@/components/reviews/ReviewFields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { randomGuestName } from "@/lib/random-guest-name";

type ReviewStatus = "PENDING" | "ACTIVE" | "DELETED";

type ReviewItem = {
  id: string;
  rating: number;
  text: string;
  name: string | null;
  status: ReviewStatus;
  listing: { id: string; title: string; slug: string } | null;
};

type ListingOption = {
  id: string;
  title: string;
  slug: string;
  reviewCount: number | null;
};

type ReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ReviewItem | null;
  listingOptions: ListingOption[];
  listingOptionsLoading?: boolean;
  defaultListingId?: string;
  onSaved: (message: string) => void;
};

const DEFAULT_FIELDS: ReviewFieldsValue = {
  rating: 5,
  text: "",
  name: "",
  anonymous: false,
};

function ReviewStarsPreview({ rating }: { rating: number }) {
  return (
    <span className="me-1.5">
      <Star className="inline size-4 fill-[#e5b34f] text-[#e5b34f]" />
      <span className="ms-1 text-xs font-medium text-muted-foreground">
        {rating}/5
      </span>
    </span>
  );
}

export function ReviewDialog({
  open,
  onOpenChange,
  editing,
  listingOptions,
  listingOptionsLoading = false,
  defaultListingId,
  onSaved,
}: ReviewDialogProps) {
  const [listingId, setListingId] = React.useState(defaultListingId ?? "");
  const [status, setStatus] = React.useState<ReviewStatus>("ACTIVE");
  const [fields, setFields] = React.useState<ReviewFieldsValue>(DEFAULT_FIELDS);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    setSubmitError("");

    if (editing) {
      setListingId(editing.listing?.id ?? "");
      setStatus(editing.status === "DELETED" ? "ACTIVE" : editing.status);
      setFields({
        rating: editing.rating,
        text: editing.text,
        name: editing.name ?? "",
        anonymous: !editing.name,
      });
    } else {
      setListingId(defaultListingId ?? "");
      setStatus("ACTIVE");
      setFields(DEFAULT_FIELDS);
    }
  }, [open, editing, defaultListingId]);

  const resetForNext = () => {
    setFields(DEFAULT_FIELDS);
    setSubmitError("");
  };

  async function submit(mode: "add" | "add-next") {
    if (submitting) return;
    setSubmitError("");

    if (!listingId) {
      setSubmitError("Please pick a listing to attach this review to.");
      return;
    }
    if (
      !Number.isInteger(fields.rating) ||
      fields.rating < 1 ||
      fields.rating > 5
    ) {
      setSubmitError("Please pick a star rating.");
      return;
    }
    if (!fields.text.trim()) {
      setSubmitError("Please write a short review.");
      return;
    }

    const payload = {
      listingId,
      status,
      rating: fields.rating,
      text: fields.text.trim(),
      name: fields.anonymous ? null : fields.name.trim() || randomGuestName(),
    };

    setSubmitting(true);
    try {
      const response = await fetch(
        editing
          ? `/api/admin/listing-reviews/${editing.id}`
          : "/api/admin/listing-reviews",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        setSubmitError(data.message ?? "Something went wrong");
        return;
      }

      onSaved(data.message ?? (editing ? "Review updated" : "Review added"));

      if (editing) {
        onOpenChange(false);
      } else if (mode === "add-next") {
        resetForNext();
      } else {
        onOpenChange(false);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedListing = listingOptions.find(
    (option) => option.id === listingId,
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit review" : "Add a review"}
      subTitle={
        editing
          ? "Update the review details below."
          : "Pick a listing and share a review on its behalf."
      }
      className="sm:max-w-2xl"
    >
      <div className="space-y-5">
        {/* Listing select */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Listing *</Label>
          <Select
            value={listingId}
            onValueChange={(value) => setListingId(value ?? "")}
          >
            <SelectTrigger
              className="w-full bg-card"
              aria-invalid={Boolean(submitError && !listingId)}
            >
              <SelectValue>
                {listingId === ""
                  ? "Select a listing…"
                  : (selectedListing?.title ?? "Select a listing…")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {listingOptionsLoading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Loading listings…
                </div>
              ) : (
                listingOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.title}
                    {option.reviewCount != null
                      ? ` (${option.reviewCount})`
                      : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {Boolean(submitError && !listingId) && (
            <p className="text-xs text-destructive">{submitError}</p>
          )}
        </div>

        {/* Status select */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus((value ?? "ACTIVE") as ReviewStatus)
            }
          >
            <SelectTrigger className="w-full bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">
                Active — visible on the site
              </SelectItem>
              <SelectItem value="PENDING">
                Pending — requires approval
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Review fields */}
        <div className="rounded-xl border bg-muted/20 p-4">
          <ReviewFields
            value={fields}
            onChange={setFields}
            idPrefix="admin-review"
          />
        </div>

        {submitError && listingId && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          {!editing ? (
            <p className="text-xs text-muted-foreground">
              Tip: use “Add &amp; next” to insert several reviews quickly.
            </p>
          ) : (
            <span className="flex items-center gap-2">
              {selectedListing ? (
                <ReviewStarsPreview rating={fields.rating} />
              ) : null}
              <span className="text-xs text-muted-foreground">
                Currently selected: {selectedListing?.title ?? "—"}
              </span>
            </span>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            {!editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void submit("add-next")}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                Add &amp; next
              </Button>
            )}

            <Button
              type="button"
              onClick={() => void submit("add")}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : editing ? (
                <Save className="mr-2 size-4" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              {editing ? "Save changes" : "Add review"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
