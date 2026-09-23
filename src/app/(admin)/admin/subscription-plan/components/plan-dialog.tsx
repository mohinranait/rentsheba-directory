"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { ControlledField } from "@/components/ui/controlled-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { subscriptionPlanFormSchema } from "@/lib/schemas/subscription-plan-schema";
import { slugify } from "@/lib/slug";
import type {
  PlanType,
  SubscriptionPlanAdminItem,
  SubscriptionPlanFormValues,
} from "@/types/subscription-plan.type";

type PlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SubscriptionPlanAdminItem | null;
  defaultType: PlanType;
  takenTypes: PlanType[];
  onSaved: (message: string) => void;
};

const PLAN_TYPE_OPTIONS: { value: PlanType; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "YEARLY", label: "Yearly" },
];

const defaultValues: SubscriptionPlanFormValues = {
  name: "",
  slug: "",
  type: "FREE",
  price: 0,
  maxListings: 1,
  durationInDays: 365,
  description: "",
  features: [],
  badge: "",
  isActive: true,
};

export function PlanDialog({
  open,
  onOpenChange,
  editing,
  defaultType,
  takenTypes,
  onSaved,
}: PlanDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<SubscriptionPlanFormValues>({
    resolver: zodResolver(subscriptionPlanFormSchema),
    defaultValues,
  });

  const nameValue = form.watch("name");
  const priceValue = form.watch("price");
  const typeValue = form.watch("type");

  useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitError(null);
    setSlugTouched(!!editing?.slug);

    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        type: editing.type,
        price: Number(editing.price),
        maxListings: editing.maxListings,
        durationInDays: editing.durationInDays,
        description: editing.description ?? "",
        features: editing.features,
        badge: editing.badge ?? "",
        isActive: editing.isActive,
      });
    } else {
      form.reset({
        ...defaultValues,
        type: defaultType,
      });
    }
  }, [open, editing, defaultType, form]);

  useEffect(() => {
    if (!slugTouched && nameValue.trim()) {
      form.setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, form]);

  async function onSubmit(values: SubscriptionPlanFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(
        editing
          ? `/api/admin/subscription-plan/${editing.id}`
          : "/api/admin/subscription-plan",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setSubmitError(data.message ?? "Something went wrong");
        return;
      }

      onSaved(data.message);
      onOpenChange(false);
    } catch {
      setSubmitError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-2xl"
      title={editing ? "Edit subscription plan" : "New subscription plan"}
      subTitle={
        editing
          ? "Update the details below and save your changes."
          : "Create a pricing plan that visitors can subscribe to."
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pr-1">
        <div className="grid gap-5 sm:grid-cols-2">
          <ControlledField
            control={form.control}
            name="name"
            label="Name *"
            description="Shown across the site, e.g. Pro yearly."
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="e.g. Pro yearly"
              />
            )}
          />

          <ControlledField
            control={form.control}
            name="slug"
            label="Slug"
            description="Used in URLs. Auto-generated from the name."
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="pro-yearly"
                onChange={(event) => {
                  setSlugTouched(true);
                  field.onChange(event);
                }}
              />
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <ControlledField
            control={form.control}
            name="type"
            label="Plan type *"
            description="Each type can only be used once."
            render={({ field, fieldState }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue>
                    {PLAN_TYPE_OPTIONS.find(
                      (option) => option.value === field.value,
                    )?.label ?? "Select a type"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="max-h-72">
                  {PLAN_TYPE_OPTIONS.map((option) => {
                    const taken =
                      takenTypes.includes(option.value) &&
                      editing?.type !== option.value;

                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={taken}
                        className="font-normal"
                      >
                        {option.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />

          <ControlledField
            control={form.control}
            name="price"
            label="Price (৳) *"
            description="0 makes it a free plan."
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                type="number"
                min={0}
                step="1"
                aria-invalid={fieldState.invalid}
                placeholder="0"
                onChange={(event) =>
                  field.onChange(
                    event.target.value === "" ? 0 : Number(event.target.value),
                  )
                }
              />
            )}
          />

          <ControlledField
            control={form.control}
            name="maxListings"
            label="Max listings *"
            description="How many listings this plan allows."
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                type="number"
                min={0}
                step="1"
                aria-invalid={fieldState.invalid}
                placeholder="5"
                onChange={(event) =>
                  field.onChange(
                    event.target.value === "" ? 0 : Number(event.target.value),
                  )
                }
              />
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ControlledField
            control={form.control}
            name="durationInDays"
            label="Duration (days) *"
            description="Billing period length in days, e.g. 365 for yearly."
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                type="number"
                min={0}
                step="1"
                aria-invalid={fieldState.invalid}
                placeholder="365"
                onChange={(event) =>
                  field.onChange(
                    event.target.value === "" ? 0 : Number(event.target.value),
                  )
                }
              />
            )}
          />

          <ControlledField
            control={form.control}
            name="badge"
            label="Badge"
            description="Optional highlight label, e.g. Best value."
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Best value"
              />
            )}
          />
        </div>

        <ControlledField
          control={form.control}
          name="description"
          label="Description"
          description="A short one-liner shown under the plan name."
          render={({ field, fieldState }) => (
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              rows={2}
              placeholder="More visibility, more room to grow."
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="features"
          label="Features"
          description="Bullet points listed on the pricing card."
          render={({ field, fieldState }) => {
            const values = field.value ?? [];

            return (
              <div className="space-y-2">
                {values.map((feature, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: editable rows can repeat values
                    key={`feature-${index}`}
                    className="flex items-start gap-2"
                  >
                    <Input
                      aria-invalid={fieldState.invalid}
                      value={feature}
                      placeholder="e.g. Featured placement"
                      onChange={(event) => {
                        const next = [...values];
                        next[index] = event.target.value;
                        field.onChange(next);
                      }}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      aria-label="Remove feature"
                      onClick={() =>
                        field.onChange(values.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}

                {values.length === 0 && (
                  <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                    No features yet — click "Add feature" to add the first
                    benefit this plan gives.
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={values.length >= 12}
                  onClick={() => field.onChange([...values, ""])}
                >
                  <Plus className="size-4" />
                  Add feature
                </Button>
              </div>
            );
          }}
        />

        <ControlledField
          control={form.control}
          name="isActive"
          label="Active status"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
              <span className="text-sm text-muted-foreground">
                {field.value ? "Visible on the site" : "Hidden from the site"}
              </span>
            </div>
          )}
        />

        {typeValue && priceValue === 0 && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Price is ৳0 — this plan will be displayed as “forever free”.
          </p>
        )}

        {submitError && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CreditCard className="size-4" />
            )}
            {editing ? "Save changes" : "Create plan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
