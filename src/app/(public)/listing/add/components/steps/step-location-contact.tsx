"use client";

import { useFormContext } from "react-hook-form";
import { ControlledField } from "@/components/ui/controlled-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

// TODO: replace with locations fetched from your API / DB
const LOCATIONS = [
  { id: "dhaka-gulshan", name: "গুলশান, ঢাকা" },
  { id: "dhaka-dhanmondi", name: "ধানমন্ডি, ঢাকা" },
  { id: "dhaka-uttara", name: "উত্তরা, ঢাকা" },
  { id: "chattogram-agrabad", name: "আগ্রাবাদ, চট্টগ্রাম" },
  { id: "sylhet-zindabazar", name: "জিন্দাবাজার, সিলেট" },
];

export function StepLocationContact() {
  const form = useFormContext<ListingFormValues>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">অবস্থান ও যোগাযোগ</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          গ্রাহকরা কীভাবে আপনাকে খুঁজে পাবে ও যোগাযোগ করবে তা জানান।
        </p>
      </div>

      <ControlledField
        control={form.control}
        name="locationId"
        label="এলাকা *"
        render={({ field, fieldState }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
              <SelectValue placeholder="একটি এলাকা বাছাই করুন" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ControlledField
          control={form.control}
          name="addressLine1"
          label="ঠিকানা লাইন ১ *"
          className="sm:col-span-2"
          render={({ field, fieldState }) => (
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="বাড়ি/রোড নম্বর, এলাকার নাম" />
          )}
        />
       
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <ControlledField
          control={form.control}
          name="phone"
          label="মোবাইল নম্বর *"
          render={({ field, fieldState }) => (
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="01712345678" />
          )}
        />
       
        <ControlledField
          control={form.control}
          name="whatsapp"
          label="হোয়াটসঅ্যাপ"
          render={({ field, fieldState }) => (
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="ঐচ্ছিক" />
          )}
        />
        <ControlledField
          control={form.control}
          name="email"
          label="ব্যবসায়িক ইমেইল"
          description="এটি লগইন ইমেইল থেকে ভিন্ন হতে পারে"
          render={({ field, fieldState }) => (
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="info@example.com" />
          )}
        />
        <ControlledField
          control={form.control}
          name="website"
          label="ওয়েবসাইট"
          className="sm:col-span-2"
          render={({ field, fieldState }) => (
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="https://" />
          )}
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-[#1A1A1A]">সোশ্যাল মিডিয়া লিংক</h3>
        <p className="mt-1 text-xs text-[#8A8371]">সবগুলো ঐচ্ছিক — যা আছে তা দিন</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["facebook", "instagram", "youtube", "linkedin", "tiktok"] as const).map((key) => (
          <ControlledField
            key={key}
            control={form.control}
            name={`socialLinks.${key}`}
            label={<span className="capitalize">{key}</span>}
            render={({ field, fieldState }) => (
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder={`https://${key}.com/...`} />
            )}
          />
        ))}
      </div>
    </div>
  );
}
