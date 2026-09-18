"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { ControlledField } from "@/components/ui/controlled-field";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminListingFormValues } from "@/lib/schemas/admin-listing-schema";
import type { DAYS_OF_WEEK } from "@/lib/schemas/listing-schema";
import { StepHeader } from "./admin-step-header";

const DAY_LABELS: Record<(typeof DAYS_OF_WEEK)[number], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function AdminStepDetails() {
  const form = useFormContext<AdminListingFormValues>();

  const { fields } = useFieldArray({
    control: form.control,
    name: "openingHours",
  });

  return (
    <div className="space-y-6">
      <StepHeader
        title="Business details"
        description="Established year, price range and weekly opening hours."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ControlledField
          control={form.control}
          name="establishedYear"
          label="Established year"
          render={({ field, fieldState }) => (
            <Input
              type="number"
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="2018"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="priceRange"
          label="Price range"
          render={({ field, fieldState }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="$">$ — Budget friendly</SelectItem>
                <SelectItem value="$$">$$ — Mid range</SelectItem>
                <SelectItem value="$$$">$$$ — Premium</SelectItem>
                <SelectItem value="$$$$">$$$$ — Luxury</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <ControlledField
          control={form.control}
          name="areaServed"
          label="Area served"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g. All of Dhaka city"
            />
          )}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Weekly opening hours</h3>

        <div className="space-y-2 rounded-lg border p-3">
          {fields.map((item, index) => {
            const isClosed = form.watch(`openingHours.${index}.isClosed`);
            const rowError =
              form.formState.errors.openingHours?.[index]?.openTime;

            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b py-2 last:border-0 sm:grid-cols-[110px_auto_1fr_1fr]"
              >
                <span className="text-sm font-medium">
                  {DAY_LABELS[item.day]}
                </span>

                <Controller
                  control={form.control}
                  name={`openingHours.${index}.isClosed`}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-xs font-normal text-muted-foreground">
                        Closed
                      </span>
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`openingHours.${index}.openTime`}
                  render={({ field, fieldState }) => (
                    <Input
                      type="time"
                      disabled={isClosed}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name={`openingHours.${index}.closeTime`}
                  render={({ field }) => (
                    <Input type="time" disabled={isClosed} {...field} />
                  )}
                />

                {rowError && (
                  <div className="col-span-full">
                    <FieldError errors={[rowError]} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
