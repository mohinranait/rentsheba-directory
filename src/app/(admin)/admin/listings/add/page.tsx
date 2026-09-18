import { Suspense } from "react";
import { AdminListingWizard } from "./components/admin-listing-wizard";

export default function AddListingPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Add / Edit Listing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new listing or update an existing one right from your panel.
        </p>
      </div>

      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
      >
        <AdminListingWizard />
      </Suspense>
    </div>
  );
}
