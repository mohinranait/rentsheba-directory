import { notFound, redirect } from "next/navigation";

import { getOwnedListing } from "@/utils/owner-listing";
import { getSessionUser } from "@/utils/session";
import { EditListingWizard } from "./components/edit-listing-wizard";

export const dynamic = "force-dynamic";

// Private, authenticated page — keep it out of search indexes
export const metadata = {
  title: "Edit listing",
  robots: { index: false, follow: false },
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await getSessionUser();
  if (!session?.userId) redirect("/login");

  // 404 for both "listing doesn't exist" and "not your listing" so a
  // user can't probe which slugs other users own.
  const detail = await getOwnedListing(slug, session.userId);
  if (!detail) notFound();

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="border-b border-[#E3DDCF] bg-[#FDFCFA]">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
            আপনার লিস্টিং সম্পাদনা করুন
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#6B6656]">
            লিস্টিং-এর যেকোনো তথ্য হালনাগাদ করুন। পরিবর্তন সংরক্ষণের পর থেকেই তা আপনার
            ড্যাশবোর্ডে প্রতিফলিত হবে।
          </p>
        </div>
      </div>

      <EditListingWizard detail={detail} />
    </main>
  );
}
