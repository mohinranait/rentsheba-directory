"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  defaultListingValues,
  type ListingFormValues,
  listingFormSchema,
  STEP_FIELDS,
} from "@/lib/schemas/listing-schema";

import { StepIndicator, type WizardStep } from "./step-indicator";
import { StepAccount } from "./steps/step-account";
import { StepBasics } from "./steps/step-basics";
import { StepDetails } from "./steps/step-details";
import { StepFeatures } from "./steps/step-features";
import { StepLocationContact } from "./steps/step-location-contact";
import { StepPhotos } from "./steps/step-photos";
import { StepPreview } from "./steps/step-preview";

const STEPS: WizardStep[] = [
  { title: "মূল তথ্য", description: "নাম ও বিবরণ" },
  { title: "অবস্থান ও যোগাযোগ", description: "ঠিকানা ও ফোন" },
  { title: "ব্যবসার বিবরণ", description: "সময় ও মূল্যমান" },
  { title: "সার্ভিস ও FAQ", description: "সুবিধা যোগ করুন" },
  { title: "ছবি", description: "কভার, লোগো, গ্যালারি" },
  { title: "অ্যাকাউন্ট", description: "ইমেইল ও পাসওয়ার্ড" },
  { title: "পর্যালোচনা", description: "সব যাচাই করুন" },
];

const DRAFT_KEY = "add-listing-draft-v1";

// Fields that cannot be persisted to localStorage (File objects)
const NON_SERIALIZABLE_KEYS = new Set(["logo", "cover", "gallery"]);

export function AddListingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // const form = useForm<ListingFormValues, undefined, ListingFormValues>({
  //   resolver: zodResolver(listingFormSchema),
  //   defaultValues: {},
  //   mode: "onChange",
  // });


  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: defaultListingValues,
    mode: "onChange",
  });

  const { reset, watch, trigger, handleSubmit } = form;

  // Restore a saved draft (text fields only — files can't survive a refresh)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);

      if (raw) {
        const saved = JSON.parse(raw) as Partial<ListingFormValues>;

        reset(
          {
            ...defaultListingValues,
            ...saved,
          } as ListingFormValues,
          {
            keepDefaultValues: false,
          },
        );
      }
    } catch {
      // Ignore corrupted draft
    }
  }, [reset]);

  // Persist draft on every change so nothing is lost while navigating steps
  useEffect(() => {
    const subscription = watch((values) => {
      const serializable = Object.fromEntries(
        Object.entries(values).filter(
          ([key]) => !NON_SERIALIZABLE_KEYS.has(key),
        ),
      );

      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(serializable),
      );
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const goToStep = (index: number) => {
    if (index <= furthestStep) {
      setCurrentStep(index);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const err = form.formState.errors;
  console.log({err});
  

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];

    const isValid = await trigger(
      fieldsToValidate as (keyof ListingFormValues)[],
    );

    if (!isValid) return;

    const next = Math.min(
      currentStep + 1,
      STEPS.length - 1,
    );

    setCurrentStep(next);
    setFurthestStep((furthest) =>
      Math.max(furthest, next),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const onSubmit: SubmitHandler<ListingFormValues> = async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);

    console.log({values});
    

    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, val]) => {
        if (key === "gallery" && Array.isArray(val)) {
          val.forEach((file) => {
            formData.append("gallery", file as File);
          });

          return;
        }

        if (val instanceof File) {
          formData.append(key, val);
          return;
        }

        if (val !== null && val !== undefined) {
          formData.append(
            key,
            typeof val === "string"
              ? val
              : JSON.stringify(val),
          );
        }
      });

      const res = await fetch("/api/public/listing", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      window.localStorage.removeItem(DRAFT_KEY);

      setIsSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setSubmitError(
        "দুঃখিত, জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <CheckCircle2 className="h-14 w-14 text-[#1F4D3D]" />

        <h1 className="mt-6 text-2xl font-semibold text-[#1A1A1A]">
          লিস্টিং জমা হয়েছে
        </h1>

        <p className="mt-3 text-sm text-[#6B6656]">
          আপনার তথ্য আমাদের টিম যাচাই করছে। যাচাই সম্পন্ন হলে
          আপনার দেওয়া ইমেইলে লগইন তথ্যসহ একটি নিশ্চিতকরণ বার্তা
          পাঠানো হবে।
        </p>

        <Button
          className="mt-8 bg-[#1F4D3D] hover:bg-[#173B2F]"
        >
          <a href="/">হোমপেজে ফিরে যান</a>
        </Button>
      </div>
    );
  }

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <FormProvider {...form}>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr] lg:py-16">
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            furthestStep={furthestStep}
            onStepClick={goToStep}
          />
        </aside>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !isLastStep) {
              event.preventDefault();
            }
          }}
        >
          <Card className="border-[#E3DDCF] bg-[#FDFCFA] p-6 sm:p-8">
            {currentStep === 0 && <StepBasics />}

            {currentStep === 1 && <StepLocationContact />}

            {currentStep === 2 && <StepDetails />}

            {currentStep === 3 && <StepFeatures />}

            {currentStep === 4 && <StepPhotos />}

            {currentStep === 5 && <StepAccount />}

            {currentStep === 6 && (
              <StepPreview onEdit={goToStep} />
            )}

            {submitError && (
              <p className="mt-4 rounded-md bg-[#FBEAE6] px-3 py-2 text-sm text-[#B45744]">
                {submitError}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-[#E3DDCF] pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="text-[#5B5648]"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                পূর্ববর্তী
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
                  জমা দিন
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#1F4D3D] hover:bg-[#173B2F]"
                >
                  পরবর্তী
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
    </FormProvider>
  );
}