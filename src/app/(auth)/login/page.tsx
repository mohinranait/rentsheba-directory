

import { CheckIcon, Heart, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AuthIllustration } from "@/components/authIllustration";
import { Button } from "@/components/ui/button";
import LoginForm from "./components/LoginForm";

const features = [
  {
    icon: MapPin,
    title: "হাজারো প্রয়োজনীয় লিস্টিং",
    description: "আপনার প্রয়োজন অনুযায়ী সেবা খুঁজে নিন।",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদ ও সহজ",
    description: "আপনার তথ্য আমাদের কাছে নিরাপদ।",
  },
  {
    icon: Heart,
    title: "আপনার পছন্দের তালিকা",
    description: "পছন্দের লিস্টিং সহজেই সংরক্ষণ করুন।",
  },
];


export default function LoginPage() {


  return (
    <>
      <AuthIllustration
        eyebrow="আপনার বিশ্বস্ত ডিরেক্টরি"
        heading="প্রয়োজনীয় সেবা খুঁজুন, পছন্দের জায়গাগুলো সংরক্ষণ করুন।"
        body="একটি অ্যাকাউন্ট থেকে আপনার পছন্দের লিস্টিং, সেবা এবং গুরুত্বপূর্ণ তথ্য সহজেই পরিচালনা করুন।"
        features={features}
      />
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
        <div className="mx-auto w-full max-w-107.5">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CheckIcon />
            </div>

            <div>
              <p className="text-base font-bold text-foreground">
                প্রিয়াঙ্গন
              </p>

              <p className="text-xs text-muted-foreground">
                আপনার বিশ্বস্ত ডিরেক্টরি
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="mb-5 hidden size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:flex">
              <CheckIcon />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              লগইন করুন
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              অ্যাকাউন্ট নেই?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                নতুন অ্যাকাউন্ট তৈরি করুন
              </Link>
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs text-muted-foreground">
                অথবা
              </span>
            </div>
          </div>

          {/* Google */}
          <Button variant="outline" className="w-full gap-2" type="button">
            <GoogleIcon />
            Google দিয়ে চালিয়ে যান
          </Button>

          {/* Security */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />

            <span>আপনার তথ্য নিরাপদ ও সুরক্ষিত</span>
          </div>

          {/* Terms */}
          <p className="mt-5 text-center text-[11px] leading-5 text-muted-foreground">
            লগইন করার মাধ্যমে আপনি আমাদের{" "}
            <Link
              href="/terms"
              className="text-primary underline-offset-4 hover:underline"
            >
              ব্যবহারের শর্তাবলি
            </Link>{" "}
            এবং{" "}
            <Link
              href="/privacy"
              className="text-primary underline-offset-4 hover:underline"
            >
              গোপনীয়তা নীতি
            </Link>
            তে সম্মতি দিচ্ছেন।
          </p>
        </div>
      </section>
    </>
  );
}


// ---------------------------------------------------------------------------
// Google icon
// ---------------------------------------------------------------------------


function GoogleIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" > <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /> <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.85A11 11 0 0 0 12 23z" /> <path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.85z" /> <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.85C6.71 7.3 9.14 5.38 12 5.38z" /> </svg>); }
