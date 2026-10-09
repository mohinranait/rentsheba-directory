import { CheckIcon, ShieldCheck } from "lucide-react";
import { AuthIllustration } from "@/components/authIllustration";
import { getSiteSettings } from "@/lib/settings";
import ForgotPasswordFlow from "./components/ForgotPasswordFlow";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; step?: "request" | "verify" }>;
}) {
  const params = await searchParams;
  const initialEmail = params.email ? decodeURIComponent(params.email) : "";
  const initialStep = params.step || (initialEmail ? "verify" : "request");
  const settings = await getSiteSettings();
  const siteName = settings.siteName || "রেন্টশেবা";

  return (
    <>
      <AuthIllustration
        eyebrow="পাসওয়ার্ড পুনরুদ্ধার"
        heading="আপনার অ্যাকাউন্টের সম্পূর্ণ নিরাপত্তা আমাদের অগ্রাধিকার।"
        body="সহজেই ইমেইল ওটিপি যাচাই করে নতুন পাসওয়ার্ড সেট করুন এবং আপনার পছন্দের সেবাগুলো নিরাপদে পরিচালনা করুন।"
      />

      <section className="flex items-center px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
        <div className="mx-auto w-full max-w-107.5">
          {/* Mobile branding */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CheckIcon className="size-5" />
            </div>

            <div>
              <p className="text-base font-bold text-foreground">
                {siteName}
              </p>

              <p className="text-xs text-muted-foreground">
                {settings.siteTagline || "আপনার বিশ্বস্ত ডিরেক্টরি"}
              </p>
            </div>
          </div>

          {/* Interactive Flow */}
          <ForgotPasswordFlow
            initialEmail={initialEmail}
            initialStep={initialStep}
          />

          {/* Security Assurance */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <span>আপনার তথ্য সম্পূর্ণ নিরাপদ ও সুরক্ষিত</span>
          </div>
        </div>
      </section>
    </>
  );
}
