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
import type { AdminListingFormValues } from "@/lib/schemas/admin-listing-schema";
import { StepHeader } from "./admin-step-header";

export function AdminStepFeatures() {
  const form = useFormContext<AdminListingFormValues>();

  const featureArray = useFieldArray({
    control: form.control,
    name: "features",
  });

  const faqArray = useFieldArray({ control: form.control, name: "faqs" });

  const featuresRootError = form.formState.errors.features?.root;

  return (
    <div className="space-y-8">
      <StepHeader
        title="Services & FAQ"
        description="List the services, amenities and common questions."
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Services & amenities *</h3>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => featureArray.append({ type: "SERVICE", name: "" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {featureArray.fields.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Nothing added yet — click the button above to add one.
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="SERVICE">Service</SelectItem>
                      <SelectItem value="AMENITY">Amenity</SelectItem>
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
                    placeholder="e.g. Free parking, home delivery"
                  />
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => featureArray.remove(index)}
                aria-label="Remove feature"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        {featuresRootError?.message && (
          <div className="mt-3">
            <FieldError errors={[{ message: featuresRootError.message }]} />
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Frequently asked questions (FAQ)
          </h3>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => faqArray.append({ question: "", answer: "" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="space-y-4">
          {faqArray.fields.map((item, index) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-start gap-2">
                <ControlledField
                  control={form.control}
                  name={`faqs.${index}.question`}
                  className="flex-1"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter a question"
                    />
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => faqArray.remove(index)}
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <ControlledField
                control={form.control}
                name={`faqs.${index}.answer`}
                render={({ field, fieldState }) => (
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    rows={2}
                    placeholder="Enter the answer"
                  />
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
