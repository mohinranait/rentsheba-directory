"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { LocationNode } from "@/app/api/locations/tree/route";
import { ControlledField } from "@/components/ui/controlled-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { AdminListingFormValues } from "@/lib/schemas/admin-listing-schema";
import { StepHeader } from "./admin-step-header";

export function AdminStepLocation() {
  const form = useFormContext<AdminListingFormValues>();
  const locationId = form.watch("locationId");

  const [divisions, setDivisions] = useState<LocationNode[]>([]);
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");

  useEffect(() => {
    fetch("/api/locations/tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDivisions(data.data);
      })
      .catch(() => {
        // Leave the dropdowns empty; field validation will guide the admin
      });
  }, []);

  // Restore the division/district selects when editing an existing listing
  useEffect(() => {
    if (!locationId || divisions.length === 0) return;

    for (const division of divisions) {
      for (const district of division.children) {
        const isUpazilaOfThisDistrict = district.children.some(
          (upazila) => upazila.id === locationId,
        );

        if (isUpazilaOfThisDistrict) {
          setDivisionId(division.id);
          setDistrictId(district.id);
          return;
        }
      }
    }
  }, [locationId, divisions]);

  const districts = useMemo(
    () =>
      divisions.find((division) => division.id === divisionId)?.children ?? [],
    [divisions, divisionId],
  );

  const upazilas = useMemo(
    () =>
      districts.find((district) => district.id === districtId)?.children ?? [],
    [districts, districtId],
  );

  const handleDivisionChange = (id: string | null) => {
    if (!id) return;
    setDivisionId(id);
    setDistrictId("");
    form.setValue("locationId", "", { shouldValidate: true });
  };

  const handleDistrictChange = (id: string | null) => {
    if (!id) return;
    setDistrictId(id);
    form.setValue("locationId", "", { shouldValidate: true });
  };

  const handleUpazilaChange = (id: string | null) => {
    if (!id) return;
    form.setValue("locationId", id, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Location & contact"
        description="How customers will find and reach you."
      />

      <ControlledField
        control={form.control}
        name="locationId"
        label="Area *"
        description="Choose division, district and upazila"
        render={({ field, fieldState }) => {
          const selectedDivision = divisions.find(
            (division) => division.id === divisionId,
          );

          const selectedDistrict = districts.find(
            (district) => district.id === districtId,
          );

          const selectedUpazila = upazilas.find(
            (upazila) => upazila.id === field.value,
          );

          return (
            <div className="space-y-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <Select value={divisionId} onValueChange={handleDivisionChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Division">
                      {selectedDivision?.nameLocal}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.nameLocal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={districtId}
                  onValueChange={handleDistrictChange}
                  disabled={!divisionId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="District">
                      {selectedDistrict?.nameLocal}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.nameLocal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={field.value || ""}
                  onValueChange={handleUpazilaChange}
                  disabled={!districtId}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Upazila">
                      {selectedUpazila?.nameLocal}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {upazilas.map((upazila) => (
                      <SelectItem key={upazila.id} value={upazila.id}>
                        {upazila.nameLocal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        }}
      />

      <ControlledField
        control={form.control}
        name="addressLine1"
        label="Address line 1 *"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="House/road number, area name"
          />
        )}
      />

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <ControlledField
          control={form.control}
          name="phone"
          label="Mobile number *"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="01712345678"
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="whatsapp"
          label="WhatsApp"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Optional"
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="email"
          label="Business email"
          description="May differ from the sign-in email"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="info@example.com"
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="website"
          label="Website"
          className="sm:col-span-2"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="https://"
            />
          )}
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium">Social media links</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          All optional — fill in what you have.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          ["facebook", "instagram", "youtube", "linkedin", "tiktok"] as const
        ).map((key) => (
          <ControlledField
            key={key}
            control={form.control}
            name={`socialLinks.${key}`}
            label={<span className="capitalize">{key}</span>}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={`https://${key}.com/…`}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
}
