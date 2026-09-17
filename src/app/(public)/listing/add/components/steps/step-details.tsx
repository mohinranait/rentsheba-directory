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
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

const DAY_LABELS_BN: Record<string, string> = {
  MONDAY: "সোমবার",
  TUESDAY: "মঙ্গলবার",
  WEDNESDAY: "বুধবার",
  THURSDAY: "বৃহস্পতিবার",
  FRIDAY: "শুক্রবার",
  SATURDAY: "শনিবার",
  SUNDAY: "রবিবার",
};

export function StepDetails() {
  const form = useFormContext<ListingFormValues>();
  const { fields } = useFieldArray({ control: form.control, name: "openingHours" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">ব্যবসার বিবরণ</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          প্রতিষ্ঠা সাল, মূল্যমান ও সাপ্তাহিক খোলার সময় জানান।
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ControlledField
          control={form.control}
          name="establishedYear"
          label="প্রতিষ্ঠা সাল"
          render={({ field, fieldState }) => (
            <Input
              type="number"
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="২০১৮"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            />
          )}
        />
        <ControlledField
          control={form.control}
          name="priceRange"
          label="মূল্যমান"
          render={({ field, fieldState }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="বাছাই করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ — সাশ্রয়ী</SelectItem>
                <SelectItem value="$$">$$ — মাঝারি</SelectItem>
                <SelectItem value="$$$">$$$ — প্রিমিয়াম</SelectItem>
                <SelectItem value="$$$$">$$$$ — বিলাসবহুল</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <ControlledField
          control={form.control}
          name="areaServed"
          label="সেবা এলাকা"
          render={({ field, fieldState }) => (
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="যেমন: পুরো ঢাকা শহর" />
          )}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[#1A1A1A]">সাপ্তাহিক খোলার সময়</h3>
        <div className="space-y-2 rounded-lg border border-[#E3DDCF] p-3">
          {fields.map((item, index) => {
            const isClosed = form.watch(`openingHours.${index}.isClosed`);
            const rowError = form.formState.errors.openingHours?.[index]?.openTime;
            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#EFEAE0] py-2 last:border-0 sm:grid-cols-[110px_auto_1fr_1fr]"
              >
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {DAY_LABELS_BN[item.day]}
                </span>

                <Controller
                  control={form.control}
                  name={`openingHours.${index}.isClosed`}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      <span className="text-xs font-normal text-[#6B6656]">বন্ধ</span>
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name={`openingHours.${index}.openTime`}
                  render={({ field, fieldState }) => (
                    <Input type="time" disabled={isClosed} aria-invalid={fieldState.invalid} {...field} />
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
