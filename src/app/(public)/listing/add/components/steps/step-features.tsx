"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ControlledField } from "@/components/ui/controlled-field";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

export function StepFeatures() {
  const form = useFormContext<ListingFormValues>();

  const featureArray = useFieldArray({ control: form.control, name: "features" });
  const faqArray = useFieldArray({ control: form.control, name: "faqs" });

  const featuresRootError = form.formState.errors.features?.root ?? form.formState.errors.features;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">সার্ভিস, সুবিধা ও সাধারণ প্রশ্ন</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          আপনি কী কী সার্ভিস দেন এবং প্রতিষ্ঠানে কী কী সুবিধা আছে তা যোগ করুন।
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#1A1A1A]">সার্ভিস ও সুবিধা *</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => featureArray.append({ type: "SERVICE", name: "" })}
          >
            <Plus className="mr-1 h-4 w-4" /> যোগ করুন
          </Button>
        </div>

        {featureArray.fields.length === 0 && (
          <p className="rounded-lg border border-dashed border-[#C9C2B2] p-4 text-center text-sm text-[#8A8371]">
            এখনও কিছু যোগ করা হয়নি — উপরের বাটনে ক্লিক করুন
          </p>
        )}

        <div className="space-y-3">
          {featureArray.fields.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2">
              <ControlledField
                control={form.control}
                name={`features.${index}.type`}
                className="w-32 shrink-0"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id={field.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICE">সার্ভিস</SelectItem>
                      <SelectItem value="AMENITY">সুবিধা</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <ControlledField
                control={form.control}
                name={`features.${index}.name`}
                className="flex-1"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="যেমন: ফ্রি পার্কিং, হোম ডেলিভারি"
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => featureArray.remove(index)}
                aria-label="মুছে ফেলুন"
              >
                <Trash2 className="h-4 w-4 text-[#B45744]" />
              </Button>
            </div>
          ))}
        </div>
        {featuresRootError?.message && <FieldError errors={[{ message: featuresRootError.message as string }]} />}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#1A1A1A]">সাধারণ প্রশ্নোত্তর (FAQ)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => faqArray.append({ question: "", answer: "" })}
          >
            <Plus className="mr-1 h-4 w-4" /> যোগ করুন
          </Button>
        </div>

        <div className="space-y-4">
          {faqArray.fields.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-[#E3DDCF] p-3">
              <div className="mb-2 flex items-start gap-2">
                <ControlledField
                  control={form.control}
                  name={`faqs.${index}.question`}
                  className="flex-1"
                  render={({ field, fieldState }) => (
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="প্রশ্ন লিখুন" />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => faqArray.remove(index)}
                  aria-label="মুছে ফেলুন"
                >
                  <Trash2 className="h-4 w-4 text-[#B45744]" />
                </Button>
              </div>
              <ControlledField
                control={form.control}
                name={`faqs.${index}.answer`}
                render={({ field, fieldState }) => (
                  <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} rows={2} placeholder="উত্তর লিখুন" />
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
