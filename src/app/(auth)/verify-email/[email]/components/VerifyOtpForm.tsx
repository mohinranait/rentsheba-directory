
'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";




// ---------------------------------------------------------------------------
// Validation schema — exactly 6 digits, digits only
// ---------------------------------------------------------------------------
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "৬ সংখ্যার কোডটি সম্পূর্ণ দিন")
    .regex(/^\d{6}$/, "শুধু সংখ্যা দিন"),
});
const RESEND_COOLDOWN_SECONDS = 45;

type OtpValues = z.infer<typeof otpSchema>;

const VerifyOtpForm = ({email}:{email:string}) => {
  const router = useRouter()
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otp = watch("otp");

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function onSubmit(values: OtpValues) {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({otp: values.otp, email }),
      });

      const data = await res.json()

      if (!data.success) {
        throw new Error("Submission failed");
      }

      router.push(`/dashboard`)

    } catch {
      setError("otp", {
        message: "কোডটি সঠিক নয়, আবার চেষ্টা করুন",
      });
    } finally {
      setIsSubmitting(false);
    }
  }


  async function handleResend() {
    setIsResending(true);

    try {
      // TODO: replace with your actual resend-otp API call
      await new Promise((resolve) => setTimeout(resolve, 700));

      reset({ otp: "" });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  }


  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
                containerClassName="justify-between"
              >
                <InputOTPGroup className="w-full justify-between gap-2 [&>div]:flex-1">
                  <InputOTPSlot
                    index={0}
                    className="h-14 flex-1 text-lg"
                  />
                  <InputOTPSlot
                    index={1}
                    className="h-14 flex-1 text-lg"
                  />
                  <InputOTPSlot
                    index={2}
                    className="h-14 flex-1 text-lg"
                  />
                </InputOTPGroup>

                <InputOTPSeparator />

                <InputOTPGroup className="w-full justify-between gap-2 [&>div]:flex-1">
                  <InputOTPSlot
                    index={3}
                    className="h-14 flex-1 text-lg"
                  />
                  <InputOTPSlot
                    index={4}
                    className="h-14 flex-1 text-lg"
                  />
                  <InputOTPSlot
                    index={5}
                    className="h-14 flex-1 text-lg"
                  />
                </InputOTPGroup>
              </InputOTP>
            )}
          />

          {errors.otp?.message && (
            <p className="mt-2 text-sm text-destructive">
              {errors.otp.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || otp?.length !== 6}
        >
          {isSubmitting ? "যাচাই হচ্ছে..." : "ভেরিফাই করুন"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        কোড পাননি?{" "}
        {cooldown > 0 ? (
          <span className="font-medium text-foreground">
            {cooldown} সেকেন্ড পর আবার পাঠান
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
          >
            {isResending ? "পাঠানো হচ্ছে..." : "আবার পাঠান"}
          </button>
        )}
      </p>
    </>
  )
}

export default VerifyOtpForm