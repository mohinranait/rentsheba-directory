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
import { Textarea } from "@/components/ui/textarea";
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

// TODO: replace with categories fetched from your API / DB
const CATEGORIES = [
  { id: "restaurants", name: "রেস্টুরেন্ট ও খাবার" },
  { id: "healthcare", name: "স্বাস্থ্যসেবা" },
  { id: "education", name: "শিক্ষা প্রতিষ্ঠান" },
  { id: "home-services", name: "হোম সার্ভিস" },
  { id: "beauty-spa", name: "বিউটি ও স্পা" },
  { id: "automotive", name: "অটোমোটিভ" },
  { id: "retail", name: "শপ ও রিটেইল" },
  { id: "professional", name: "প্রফেশনাল সার্ভিস" },
];

export function StepBasics() {
  const form = useFormContext<ListingFormValues>();
  const descriptionValue = form.watch("description") ?? "";
  const shortDescriptionValue = form.watch("shortDescription") ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">মূল তথ্য</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          আপনার প্রতিষ্ঠানের নাম ও সংক্ষিপ্ত পরিচিতি দিন — এটিই ভিজিটররা প্রথমে দেখবে।
        </p>
      </div>

      <ControlledField
        control={form.control}
        name="title"
        label="প্রতিষ্ঠানের নাম *"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="যেমন: গ্রিন লিফ কফি হাউস"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="tagline"
        label="ট্যাগলাইন"
        description="ঐচ্ছিক — লিস্টিং কার্ডে হেডলাইনের নিচে দেখা যাবে।"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="এক লাইনে আপনার ব্যবসার পরিচয়"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="categoryId"
        label="ক্যাটাগরি *"
        render={({ field, fieldState }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
              <SelectValue placeholder="একটি ক্যাটাগরি বাছাই করুন" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <ControlledField
        control={form.control}
        name="shortDescription"
        label="সংক্ষিপ্ত বিবরণ"
        description={`${shortDescriptionValue.length}/500 অক্ষর`}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            rows={2}
            placeholder="সার্চ রেজাল্ট ও কার্ডে দেখানোর জন্য এক-দুই লাইনের বিবরণ"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="description"
        label="বিস্তারিত বিবরণ *"
        description={`${descriptionValue.length}/5000 অক্ষর, কমপক্ষে ৫০ অক্ষর`}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            rows={7}
            placeholder="আপনার প্রতিষ্ঠান সম্পর্কে বিস্তারিত লিখুন — কী সেবা দেন, কেন গ্রাহকরা আপনাকে বেছে নেবেন..."
          />
        )}
      />
    </div>
  );
}
