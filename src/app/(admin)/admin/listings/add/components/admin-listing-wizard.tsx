"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import type { AdminListingDetail } from "@/app/api/admin/listing/[slug]/route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ADMIN_STEP_FIELDS,
  type AdminListingFormValues,
  adminListingFormSchema,
  defaultAdminListingValues,
} from "@/lib/schemas/admin-listing-schema";
import { cn } from "@/lib/utils";
import {
  buildEditValues,
  type ExistingListingMedia,
  getExistingMedia,
} from "@/utils/admin-listing-detail";
import type { AdminListingRemovals } from "@/utils/admin-listing-form";
import { AdminStepBasics } from "./steps/admin-step-basics";
import { AdminStepDetails } from "./steps/admin-step-details";
import { AdminStepFeatures } from "./steps/admin-step-features";
import { AdminStepLocation } from "./steps/admin-step-location";
import { AdminStepPhotos } from "./steps/admin-step-photos";
import { AdminStepReview } from "./steps/admin-step-review";

const STEPS: { title: string; description: string }[] = [
  { title: "Basic information", description: "Title & description" },
  { title: "Location & contact", description: "Address, phone & socials" },
  { title: "Business details", description: "Hours & pricing" },
  { title: "Services & FAQ", description: "Features & questions" },
  { title: "Photos", description: "Cover, logo & gallery" },
  { title: "Review & submit", description: "Check everything" },
];

export function AdminListingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");

  const isEdit = Boolean(editSlug);

  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [editError, setEditError] = useState<string | null>(null);

  const [existingMedia, setExistingMedia] = useState<ExistingListingMedia>({
    logo: null,
    thumbnail: null,
    gallery: [],
  });

  const [removals, setRemovals] = useState<AdminListingRemovals>({
    coverRemoved: false,
    logoRemoved: false,
    galleryRemoved: [],
  });

  const [status, setStatus] = useState("APPROVED");

  const form = useForm<AdminListingFormValues>({
    resolver: zodResolver(adminListingFormSchema),
    defaultValues: defaultAdminListingValues,
    mode: "onChange",
  });

  // Load the existing listing when editing
  useEffect(() => {
    if (!isEdit || !editSlug) return;

    let isActive = true;

    async function load() {
      setLoadingEdit(true);
      setEditError(null);

      try {
        const res = await fetch(
          `/api/admin/listing/${encodeURIComponent(editSlug ?? "")}`,
        );
        const data = (await res.json()) as {
          success: boolean;
          message?: string;
          data?: AdminListingDetail;
        };

        if (!res.ok || !data.success || !data.data) {
          throw new Error(data.message ?? "Failed to load listing");
        }

        if (!isActive) return;

        form.reset(buildEditValues(data.data), {
          keepDefaultValues: false,
        });

        setExistingMedia(getExistingMedia(data.data));
        setStatus(data.data.verificationStatus);
        setRemovals({
          coverRemoved: false,
          logoRemoved: false,
          galleryRemoved: [],
        });
      } catch (error) {
        if (isActive) {
          setEditError(
            error instanceof Error
              ? error.message
              : "Failed to load the listing",
          );
        }
      } finally {
        if (isActive) {
          setLoadingEdit(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [isEdit, editSlug, form]);

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

      // Chosen status
      formData.append("status", status);

      // Files
      if (values.cover) {
        formData.append("cover", values.cover);
      }

      if (values.logo) {
        formData.append("logo", values.logo);
      }

      (values.gallery ?? []).forEach((file) => {
        formData.append("gallery", file);
      });

      // Existing-image removals (edit mode only)
      if (removals.coverRemoved) {
        formData.append("coverRemoved", "true");
      }

      if (removals.logoRemoved) {
        formData.append("logoRemoved", "true");
      }

      if (removals.galleryRemoved.length > 0) {
        formData.append(
          "galleryRemoved",
          JSON.stringify(removals.galleryRemoved),
        );
      }

      const url = isEdit
        ? `/api/admin/listing/${encodeURIComponent(editSlug ?? "")}`
        : "/api/admin/listing";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: { slug?: string };
      };

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Save failed");
      }

      const savedSlug = data.data?.slug ?? editSlug;

      if (savedSlug) {
        router.push(`/admin/listings/edit/${savedSlug}`);
      } else {
        router.push("/admin/listings");
      }

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
          <AdminStepReview
            onEdit={goToStep}
            status={status}
            onStatusChange={setStatus}
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
      <div className="flex flex-col gap-6">
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
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px]",
                      isComplete
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border border-primary text-primary"
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

        {loadingEdit ? (
          <Card className="p-6 sm:p-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </Card>
        ) : editError ? (
          <Card className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">{editError}</p>

            <Button
              variant="outline"
              onClick={() => router.push("/admin/listings")}
            >
              Back to listings
            </Button>
          </Card>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isLastStep) {
                event.preventDefault();
              }
            }}
            className="w-5xl"
          >
            <Card className="p-6 sm:p-8">
              {renderStep()}

              {submitError && (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {submitError}
                </p>
              )}

              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isSubmitting}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>

                {isLastStep ? (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEdit ? "Save changes" : "Create listing"}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => void handleNext()}>
                    Next
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </form>
        )}
      </div>
    </FormProvider>
  );
}
