"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------------------------

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "আপনার পূর্ণ নাম দিন")
      .min(2, "নাম কমপক্ষে ২ ক্যারেক্টার হতে হবে"),

    email: z
      .string()
      .trim()
      .min(1, "ইমেইল অ্যাড্রেস দিন")
      .email("সঠিক ইমেইল অ্যাড্রেস দিন"),

    password: z
      .string()
      .min(1, "পাসওয়ার্ড দিন")
      .min(6, "কমপক্ষে ৬ ক্যারেক্টারের পাসওয়ার্ড দিন"),

    confirmPassword: z
      .string()
      .min(1, "পাসওয়ার্ড নিশ্চিত করুন"),

    terms: z.boolean().refine((val) => val === true, {
      message: "শর্তাবলি ও গোপনীয়তা নীতিতে সম্মতি প্রয়োজন",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড দুটি মিলছে না",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  nextPath?: string;
}

export default function RegisterForm({ nextPath }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  async function onSubmit(values: RegisterValues) {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          title: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      }

      // Verification OTP sent -> redirect to verify page
      const verifyUrl = `/verify-email/${encodeURIComponent(values.email)}${
        nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
      }`;
      router.push(verifyUrl);
    } catch (err: any) {
      setApiError(
        err?.message || "কিছু ভুল হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Name */}
      <Field
        data-invalid={!!form.formState.errors.name}
        orientation="vertical"
      >
        <FieldLabel htmlFor="name">পূর্ণ নাম</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            type="text"
            placeholder="আপনার নাম লিখুন"
            autoComplete="name"
            aria-invalid={!!form.formState.errors.name}
            className="h-11 rounded-xl sm:h-12"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </FieldContent>
      </Field>

      {/* Email */}
      <Field
        data-invalid={!!form.formState.errors.email}
        orientation="vertical"
      >
        <FieldLabel htmlFor="email">ইমেইল অ্যাড্রেস</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            className="h-11 rounded-xl sm:h-12"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <FieldError>{form.formState.errors.email.message}</FieldError>
          )}
        </FieldContent>
      </Field>

      {/* Password */}
      <Field
        data-invalid={!!form.formState.errors.password}
        orientation="vertical"
      >
        <FieldLabel htmlFor="password">পাসওয়ার্ড</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="কমপক্ষে ৬ ক্যারেক্টার"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.password}
              className="h-11 rounded-xl pr-11 sm:h-12"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <FieldError>{form.formState.errors.password.message}</FieldError>
          )}
        </FieldContent>
      </Field>

      {/* Confirm Password */}
      <Field
        data-invalid={!!form.formState.errors.confirmPassword}
        orientation="vertical"
      >
        <FieldLabel htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              className="h-11 rounded-xl pr-11 sm:h-12"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
              aria-label={
                showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <FieldError>
              {form.formState.errors.confirmPassword.message}
            </FieldError>
          )}
        </FieldContent>
      </Field>

      {/* Terms & Conditions */}
      <Field
        orientation="horizontal"
        data-invalid={!!form.formState.errors.terms}
        className="pt-1"
      >
        <Checkbox
          id="terms"
          checked={form.watch("terms")}
          onCheckedChange={(checked) => {
            form.setValue("terms", checked === true, { shouldValidate: true });
          }}
        />
        <FieldLabel
          htmlFor="terms"
          className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground"
        >
          আমি{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ব্যবহারের শর্তাবলি
          </Link>{" "}
          এবং{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            গোপনীয়তা নীতি
          </Link>{" "}
          মেনে নিচ্ছি
        </FieldLabel>
      </Field>
      {form.formState.errors.terms && (
        <FieldError className="text-xs">
          {form.formState.errors.terms.message}
        </FieldError>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-11 w-full rounded-xl bg-primary font-semibold sm:h-12"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            অ্যাকাউন্ট তৈরি হচ্ছে...
          </>
        ) : (
          <>
            অ্যাকাউন্ট তৈরি করুন
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
