"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  furthestStep: number;
  onStepClick: (index: number) => void;
}

export function StepIndicator({ steps, currentStep, furthestStep, onStepClick }: StepIndicatorProps) {
  return (
    <>
      {/* Desktop: vertical rail */}
      <nav aria-label="ধাপসমূহ" className="hidden lg:block">
        <ol className="relative space-y-1">
          {steps.map((step, index) => {
            const isComplete = index < furthestStep;
            const isCurrent = index === currentStep;
            const isReachable = index <= furthestStep;

            return (
              <li key={step.title} className="relative">
                <button
                  type="button"
                  disabled={!isReachable}
                  onClick={() => onStepClick(index)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    isReachable ? "cursor-pointer hover:bg-[#EFEAE0]" : "cursor-not-allowed opacity-50",
                    isCurrent && "bg-[#EFEAE0]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                      isComplete && "border-[#1F4D3D] bg-[#1F4D3D] text-white",
                      isCurrent && !isComplete && "border-[#1F4D3D] text-[#1F4D3D]",
                      !isCurrent && !isComplete && "border-[#C9C2B2] text-[#8A8371]"
                    )}
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-[#1A1A1A]" : "text-[#5B5648]"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="text-xs text-[#8A8371]">{step.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile: horizontal progress */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-[#1A1A1A]">
            {steps[currentStep].title}
          </span>
          <span className="text-xs text-[#8A8371]">
            ধাপ {currentStep + 1} / {steps.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((step, index) => (
            <button
              key={step.title}
              type="button"
              aria-label={step.title}
              disabled={index > furthestStep}
              onClick={() => onStepClick(index)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index <= furthestStep ? "bg-[#1F4D3D]" : "bg-[#E3DDCF]",
                index === currentStep && "opacity-100",
                index < currentStep && "opacity-60"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}
