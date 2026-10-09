"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const RESEND_COOLDOWN_SECONDS = 45;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "ইমেইল অ্যাড্রেস দিন")
    .email("সঠিক ইমেইল অ্যাড্রেস দিন"),
});

const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, "৬ সংখ্যার ওটিপি কোডটি সম্পূর্ণ দিন")
      .regex(/^\d{6}$/, "শুধু সংখ্যা দিন"),
    password: z
      .string()
      .min(1, "নতুন পাসওয়ার্ড দিন")
      .min(6, "কমপক্ষে ৬ ক্যারেক্টারের পাসওয়ার্ড দিন"),
    confirmPassword: z.string().min(1, "পাসওয়ার্ড নিশ্চিত করুন"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড দুটি মিলছে না",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface ForgotPasswordFlowProps {
  initialEmail?: string;
  initialStep?: "request" | "verify" | "success";
}

export default function ForgotPasswordFlow({
  initialEmail = "",
  initialStep = "request",
}: ForgotPasswordFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify" | "success">(
    initialEmail && initialStep === "verify" ? "verify" : "request",
  );
  const [email, setEmail] = useState(initialEmail);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  // Reset form
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== "verify" || cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Request OTP Handler
  async function handleRequestOtp(values: EmailFormValues) {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "ওটিপি পাঠাতে সমস্যা হয়েছে");
      }

      setEmail(values.email);
      setStep("verify");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setApiError(
        err?.message || "কিছু ভুল হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Resend OTP Handler
  async function handleResendOtp() {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setApiError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে");
      }

      resetForm.setValue("otp", "");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setApiError(
        err?.message || "ওটিপি পাঠাতে ব্যর্থ হয়েছে, আবার চেষ্টা করুন",
      );
    } finally {
      setIsResending(false);
    }
  }

  // Reset Password Handler
  async function handleResetPassword(values: ResetPasswordValues) {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: values.otp,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে");
      }

      setStep("success");
    } catch (err: any) {
      setApiError(
        err?.message || "কিছু ভুল হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // =========================================================================
  // STEP 3: SUCCESS
  // =========================================================================
  if (step === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
          <CheckCircle2 className="size-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            আপনার অ্যাকাউন্টের নতুন পাসওয়ার্ড সেট করা হয়েছে। এখন নতুন পাসওয়ার্ড
            দিয়ে সরাসরি লগইন করুন।
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="h-11 w-full rounded-xl bg-primary font-semibold sm:h-12"
          >
            লগইন পেজে যান
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 2: VERIFY OTP & RESET PASSWORD
  // =========================================================================
  if (step === "verify") {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4 hidden size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:flex">
            <KeyRound className="size-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            ওটিপি ও নতুন পাসওয়ার্ড
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            আমরা <strong className="text-foreground">{email}</strong> ঠিকানায়
            ৬-সংখ্যার কোড পাঠিয়েছি।{" "}
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setApiError(null);
              }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              ইমেইল পরিবর্তন
            </button>
          </p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form
          onSubmit={resetForm.handleSubmit(handleResetPassword)}
          className="space-y-4"
        >
          {/* OTP Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="otp"
                className="text-sm font-medium text-foreground"
              >
                ৬-সংখ্যার ওটিপি কোড
              </label>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isResending}
                className="text-xs font-medium text-primary underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {isResending ? (
                  "পাঠানো হচ্ছে..."
                ) : cooldown > 0 ? (
                  `পুনরায় পাঠান (${cooldown}s)`
                ) : (
                  "ওটিপি পুনরায় পাঠান"
                )}
              </button>
            </div>

            <Controller
              control={resetForm.control}
              name="otp"
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  containerClassName="justify-between"
                >
                  <InputOTPGroup className="w-full justify-between gap-2 [&>div]:flex-1">
                    <InputOTPSlot index={0} className="h-12 text-base font-bold rounded-lg" />
                    <InputOTPSlot index={1} className="h-12 text-base font-bold rounded-lg" />
                    <InputOTPSlot index={2} className="h-12 text-base font-bold rounded-lg" />
                    <InputOTPSlot index={3} className="h-12 text-base font-bold rounded-lg" />
                    <InputOTPSlot index={4} className="h-12 text-base font-bold rounded-lg" />
                    <InputOTPSlot index={5} className="h-12 text-base font-bold rounded-lg" />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            {resetForm.formState.errors.otp && (
              <p className="text-xs text-destructive">
                {resetForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <Field
            data-invalid={!!resetForm.formState.errors.password}
            orientation="vertical"
          >
            <FieldLabel htmlFor="new-password">নতুন পাসওয়ার্ড</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="কমপক্ষে ৬ ক্যারেক্টার"
                  autoComplete="new-password"
                  aria-invalid={!!resetForm.formState.errors.password}
                  className="h-11 rounded-xl pr-11 sm:h-12"
                  {...resetForm.register("password")}
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
              {resetForm.formState.errors.password && (
                <FieldError>
                  {resetForm.formState.errors.password.message}
                </FieldError>
              )}
            </FieldContent>
          </Field>

          {/* Confirm Password */}
          <Field
            data-invalid={!!resetForm.formState.errors.confirmPassword}
            orientation="vertical"
          >
            <FieldLabel htmlFor="confirm-new-password">
              নতুন পাসওয়ার্ড নিশ্চিত করুন
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                  autoComplete="new-password"
                  aria-invalid={!!resetForm.formState.errors.confirmPassword}
                  className="h-11 rounded-xl pr-11 sm:h-12"
                  {...resetForm.register("confirmPassword")}
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
              {resetForm.formState.errors.confirmPassword && (
                <FieldError>
                  {resetForm.formState.errors.confirmPassword.message}
                </FieldError>
              )}
            </FieldContent>
          </Field>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-xl bg-primary font-semibold sm:h-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                পাসওয়ার্ড পরিবর্তন হচ্ছে...
              </>
            ) : (
              <>
                পাসওয়ার্ড পরিবর্তন করুন
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            লগইন পেজে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 1: REQUEST OTP
  // =========================================================================
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 hidden size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:flex">
          <Mail className="size-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          পাসওয়ার্ড ভুলে গেছেন?
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          আপনার নিবন্ধিত ইমেইল অ্যাড্রেসটি লিখুন। আমরা ৬-সংখ্যার একটি ওটিপি
          কোড পাঠাব।
        </p>
      </div>

      {apiError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form
        onSubmit={emailForm.handleSubmit(handleRequestOtp)}
        className="space-y-4"
      >
        <Field
          data-invalid={!!emailForm.formState.errors.email}
          orientation="vertical"
        >
          <FieldLabel htmlFor="request-email">ইমেইল অ্যাড্রেস</FieldLabel>
          <FieldContent>
            <Input
              id="request-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!emailForm.formState.errors.email}
              className="h-11 rounded-xl sm:h-12"
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <FieldError>
                {emailForm.formState.errors.email.message}
              </FieldError>
            )}
          </FieldContent>
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-11 w-full rounded-xl bg-primary font-semibold sm:h-12"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              কোড পাঠানো হচ্ছে...
            </>
          ) : (
            <>
              ওটিপি কোড পাঠান
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          লগইন পেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
