"use client";

import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { ControlledField } from "@/components/ui/controlled-field";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

export function StepAccount() {
  const form = useFormContext<ListingFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const password = form.watch("password") ?? "";

  const rules = [
    { label: "কমপক্ষে ৮ অক্ষর", valid: password.length >= 8 },
    { label: "একটি বড় হাতের অক্ষর", valid: /[A-Z]/.test(password) },
    { label: "একটি ছোট হাতের অক্ষর", valid: /[a-z]/.test(password) },
    { label: "একটি সংখ্যা", valid: /[0-9]/.test(password) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">অ্যাকাউন্ট তৈরি করুন</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          লিস্টিং ম্যানেজ করার জন্য একটি ইমেইল ও পাসওয়ার্ড সেট করুন — এটি দিয়েই পরে লগইন করবেন।
        </p>
      </div>

      <ControlledField
        control={form.control}
        name="loginEmail"
        label="ইমেইল *"
        render={({ field, fieldState }) => (
          <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} placeholder="you@example.com" />
        )}
      />

      <ControlledField
        control={form.control}
        name="password"
        label="পাসওয়ার্ড *"
        render={({ field, fieldState }) => (
          <>
            <div className="relative">
              <Input
                {...field}
                id={field.name}
                type={showPassword ? "text" : "password"}
                aria-invalid={fieldState.invalid}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8371]"
                aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              {rules.map((rule) => (
                <span
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-xs ${rule.valid ? "text-[#1F4D3D]" : "text-[#8A8371]"}`}
                >
                  <ShieldCheck className={`h-3 w-3 ${rule.valid ? "opacity-100" : "opacity-30"}`} />
                  {rule.label}
                </span>
              ))}
            </div>
          </>
        )}
      />

      <ControlledField
        control={form.control}
        name="confirmPassword"
        label="পাসওয়ার্ড নিশ্চিত করুন *"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            type={showPassword ? "text" : "password"}
            aria-invalid={fieldState.invalid}
            placeholder="••••••••"
          />
        )}
      />

      <ControlledField
        control={form.control}
        name="agreeToTerms"
        orientation="horizontal"
        className="rounded-lg border border-[#E3DDCF] bg-[#FBF9F4] p-3"
        render={({ field, fieldState }) => (
          <>
            <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} aria-invalid={fieldState.invalid} />
            <div>
              <label htmlFor={field.name} className="text-sm font-normal text-[#1A1A1A]">
                আমি নিশ্চিত করছি এই তথ্যগুলো সঠিক এবং আমি{" "}
                <a href="/terms" className="text-[#1F4D3D] underline">
                  শর্তাবলী
                </a>{" "}
                মেনে নিচ্ছি *
              </label>
              <FieldDescription>জমা দেওয়ার পর অ্যাডমিন যাচাই করে অনুমোদন দেবেন।</FieldDescription>
            </div>
          </>
        )}
      />
    </div>
  );
}
