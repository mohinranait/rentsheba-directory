import type { Metadata } from "next";
import { AddListingWizard } from "./components/add-listing-wizard";

export const metadata: Metadata = {
  title: "আপনার প্রতিষ্ঠান যোগ করুন",
  description: "কয়েকটি সহজ ধাপে আপনার ব্যবসা ডিরেক্টরিতে যুক্ত করুন",
};

export default function AddListingPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="border-b border-[#E3DDCF] bg-[#FDFCFA]">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
            আপনার প্রতিষ্ঠান যোগ করুন
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#6B6656]">
            মাত্র কয়েকটি ধাপে আপনার ব্যবসার তথ্য দিন। জমা দেওয়ার পর আমাদের টিম যাচাই করে
            অনুমোদন দেবে এবং লগইন তথ্য আপনার ইমেইলে পাঠাবে।
          </p>
        </div>
      </div>
      <AddListingWizard />
    </main>
  );
}
