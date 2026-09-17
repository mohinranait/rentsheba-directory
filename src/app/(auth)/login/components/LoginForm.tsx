"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
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
// Validation
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "ইমেইল দিন")
    .email("সঠিক ইমেইল অ্যাড্রেস দিন"),

  password: z
    .string()
    .min(1, "পাসওয়ার্ড দিন")
    .min(6, "কমপক্ষে ৮ ক্যারেক্টারের পাসওয়ার্ড দিন"),

  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;


const LoginForm = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);

    try {
     const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const data = await res.json()

      if (!data.success) {
        throw new Error("Submission failed");
      }

      router.push(`/dashboard`)

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email */}
      <Field
        data-invalid={!!form.formState.errors.email}
        orientation="vertical"
      >
        <FieldLabel htmlFor="email">ইমেইল</FieldLabel>

        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            className="h-12 rounded-xl"
            {...form.register("email")}
          />

          {form.formState.errors.email && (
            <FieldError>
              {form.formState.errors.email.message}
            </FieldError>
          )}
        </FieldContent>
      </Field>

      {/* Password */}
      <Field
        data-invalid={!!form.formState.errors.password}
        orientation="vertical"
      >
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="password">
            পাসওয়ার্ড
          </FieldLabel>

          <Link
            href="/forgot-password"
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <FieldContent>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              className="h-12 rounded-xl pr-11"
              {...form.register("password")}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
              aria-label={
                showPassword
                  ? "পাসওয়ার্ড লুকান"
                  : "পাসওয়ার্ড দেখান"
              }
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          {form.formState.errors.password && (
            <FieldError>
              {form.formState.errors.password.message}
            </FieldError>
          )}
        </FieldContent>
      </Field>

      {/* Remember */}
      <Field orientation="horizontal">
        <Checkbox
          id="remember"
          checked={form.watch("remember")}
          onCheckedChange={(checked) => {
            form.setValue("remember", checked === true);
          }}
        />

        <FieldLabel
          htmlFor="remember"
          className="cursor-pointer text-sm font-normal text-muted-foreground"
        >
          এই ডিভাইসে লগইন মনে রাখুন
        </FieldLabel>
      </Field>

      {/* Login */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/20"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            লগইন হচ্ছে...
          </>
        ) : (
          <>
            লগইন করুন
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}

export default LoginForm