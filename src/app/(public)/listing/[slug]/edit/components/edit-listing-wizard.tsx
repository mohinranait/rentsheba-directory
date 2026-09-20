"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import type { AdminListingDetail } from "@/app/api/admin/listing/[slug]/route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ADMIN_STEP_FIELDS,
  type AdminListingFormValues,
  adminListingFormSchema,
} from "@/lib/schemas/admin-listing-schema";
import { cn } from "@/lib/utils";
import {
  buildEditValues,
  getExistingMedia,
} from "@/utils/admin-listing-detail";
import type { AdminListingRemovals } from "@/utils/admin-listing-form";
// The listing field rules (validation + input components) are identical for
// admin and owners, so the same steps are reused here instead of duplicated.
import { AdminStepBasics } from "../../../../../(admin)/admin/listings/add/components/steps/admin-step-basics";
import { AdminStepDetails } from "../../../../../(admin)/admin/listings/add/components/steps/admin-step-details";
import { AdminStepFeatures } from "../../../../../(admin)/admin/listings/add/components/steps/admin-step-features";
import { AdminStepLocation } from "../../../../../(admin)/admin/listings/add/components/steps/admin-step-location";
import { AdminStepPhotos } from "../../../../../(admin)/admin/listings/add/components/steps/admin-step-photos";
import { EditStepReview } from "./edit-step-review";

const STEPS: { title: string; description: string }[] = [
  { title: "Basic information", description: "Title & description" },
  { title: "Location & contact", description: "Address, phone & socials" },
  { title: "Business details", description: "Hours & pricing" },
  { title: "Services & FAQ", description: "Features & questions" },
  { title: "Photos", description: "Cover, logo & gallery" },
  { title: "Review & submit", description: "Check everything" },
];

export function EditListingWizard({ detail }: { detail: AdminListingDetail }) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const existingMedia = useMemo(() => getExistingMedia(detail), [detail]);

  const [removals, setRemovals] = useState<AdminListingRemovals>({
    coverRemoved: false,
    logoRemoved: false,
    galleryRemoved: [],
  });

  const defaultValues = useMemo(() => buildEditValues(detail), [detail]);

  const form = useForm<AdminListingFormValues>({
    resolver: zodResolver(adminListingFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const goToStep = (index: number) => {
    if (index > furthestStep) return;

    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = async () => {
    const fieldsToValidate = ADMIN_STEP_FIELDS[currentStep];
    const isValid = await form.trigger(
      fieldsToValidate as (keyof AdminListingFormValues)[],
    );

    if (!isValid) return;

    const next = Math.min(currentStep + 1, STEPS.length - 1);

    setCurrentStep(next);
    setFurthestStep((furthest) => Math.max(furthest, next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit: SubmitHandler<AdminListingFormValues> = async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();

      // Text fields
      formData.append("title", values.title);
      formData.append("tagline", values.tagline ?? "");
      formData.append("categoryId", values.categoryId);
      formData.append("shortDescription", values.shortDescription ?? "");
      formData.append("description", values.description);
      formData.append("locationId", values.locationId);
      formData.append("addressLine1", values.addressLine1);
      formData.append("phone", values.phone);
      formData.append("email", values.email ?? "");
      formData.append("website", values.website ?? "");
      formData.append("whatsapp", values.whatsapp ?? "");

      // JSON text fields
      formData.append("socialLinks", JSON.stringify(values.socialLinks));
      formData.append("openingHours", JSON.stringify(values.openingHours));
      formData.append("features", JSON.stringify(values.features));
      formData.append("faqs", JSON.stringify(values.faqs));

      // Business details
      formData.append(
        "establishedYear",
        values.establishedYear ? String(values.establishedYear) : "",
      );
      formData.append("priceRange", values.priceRange ?? "");
      formData.append("areaServed", values.areaServed ?? "");

      // Files (only when the user actually picked something new)
      if (values.cover) formData.append("cover", values.cover);
      if (values.logo) formData.append("logo", values.logo);
      (values.gallery ?? []).forEach((file) => {
        formData.append("gallery", file);
      });

      // Existing-image removals (tracked separately from the new files)
      if (removals.coverRemoved) formData.append("coverRemoved", "true");
      if (removals.logoRemoved) formData.append("logoRemoved", "true");
      if (removals.galleryRemoved.length > 0) {
        formData.append(
          "galleryRemoved",
          JSON.stringify(removals.galleryRemoved),
        );
      }

      const res = await fetch(
        `/api/public/listing/${encodeURIComponent(detail.slug)}`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      const data = (await res.json()) as { success: boolean; message?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Save failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { handleSubmit } = form;

  const isLastStep = currentStep === STEPS.length - 1;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AdminStepBasics />;
      case 1:
        return <AdminStepLocation />;
      case 2:
        return <AdminStepDetails />;
      case 3:
        return <AdminStepFeatures />;
      case 4:
        return (
          <AdminStepPhotos
            existingMedia={existingMedia}
            removals={removals}
            onRemovalChange={setRemovals}
          />
        );
      case 5:
        return (
          <EditStepReview
            onEdit={goToStep}
            existingMedia={existingMedia}
            removals={removals}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-5xl px-4 py-10 lg:py-14">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#36705e] transition-colors hover:text-[#133f35]"
        >
          <LayoutDashboard className="size-4" />
          Back to dashboard
        </Link>

        <div className="mt-5 flex flex-col gap-6">
          {/* Stepper */}
          <ol className="flex flex-wrap items-center gap-2">
            {STEPS.map((step, index) => {
              const isComplete = index < furthestStep;
              const isCurrent = index === currentStep;
              const isReachable = index <= furthestStep;

              return (
                <li key={step.title}>
                  <button
                    type="button"
                    disabled={!isReachable}
                    onClick={() => goToStep(index)}
                    className={cn(
                      "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      isReachable
                        ? "cursor-pointer hover:bg-muted"
                        : "cursor-not-allowed opacity-50",
                      isCurrent
                        ? "border-[#1F4D3D] text-[#1F4D3D]"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[10px]",
                        isComplete
                          ? "bg-[#1F4D3D] text-white"
                          : isCurrent
                            ? "border border-[#1F4D3D] text-[#1F4D3D]"
                            : "border border-border text-muted-foreground",
                      )}
                    >
                      {isComplete ? <Check className="size-2.5" /> : index + 1}
                    </span>

                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {detail.slug && (
            <p className="text-xs text-[#6B6656]">
              Editing <span className="font-semibold">{detail.title}</span> —{" "}
              <span className="font-mono">/{detail.slug}</span>
            </p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isLastStep) {
                event.preventDefault();
              }
            }}
          >
            <Card className="border-[#E3DDCF] bg-[#FDFCFA] p-6 sm:p-8">
              {renderStep()}

              {submitError && (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-[#FBEAE6] px-3 py-2 text-sm text-[#B45744]"
                >
                  {submitError}
                </p>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-[#E3DDCF] pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isSubmitting}
                  className="text-[#5B5648]"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Previous
                </Button>

                {isLastStep ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1F4D3D] hover:bg-[#173B2F]"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save changes
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => void handleNext()}
                    className="bg-[#1F4D3D] hover:bg-[#173B2F] text-white"
                  >
                    Next
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
