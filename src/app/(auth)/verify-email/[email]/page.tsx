
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthIllustration } from "@/components/authIllustration";
import VerifyOtpForm from "./components/VerifyOtpForm";




type VerifyEmailPageProps = {
  params: Promise<{
    email: string;
  }>;
};

export default async function VerifyEmailPage({
  params,
}: VerifyEmailPageProps) {

  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);


  return (

    <>
      <AuthIllustration
        eyebrow="প্রায় হয়ে গেছে"
        heading="আপনার ইমেইলে একটা কোড পাঠানো হয়েছে"
        body="আপনার অ্যাকাউন্টের নিরাপত্তার জন্য এই ছোট্ট ধাপটুকু — কোডটি বসিয়ে দিলেই আপনি ভেতরে ঢুকে যাবেন।"
      />
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              ইমেইল ভেরিফাই করুন
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              আমরা{" "}
              <span className="font-medium text-foreground">{decodedEmail}</span>{" "}
              এই ঠিকানায় ৬-সংখ্যার একটা কোড পাঠিয়েছি।
            </p>
          </div>

          <VerifyOtpForm email={decodedEmail}/>



          <Link
            href="/login"
            className="mt-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft />
            লগইন পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </>
  );
}