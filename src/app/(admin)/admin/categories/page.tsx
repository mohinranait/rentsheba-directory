import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

<div className="space-y-6">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        All Categories 👋
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Here&apos;s what&apos;s happening with Rentsheba today.
      </p>
    </div>

    <Button>
      <Plus />
      Add New categories
    </Button>
  </div>

  <div>
    {/* REnder table here */}
  </div>
</div>