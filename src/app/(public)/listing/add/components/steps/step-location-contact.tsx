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
import type { ListingFormValues } from "@/lib/schemas/listing-schema";

export function StepLocationContact() {
  const form = useFormContext<ListingFormValues>();
  const locationId = form.watch("locationId");

  const [divisions, setDivisions] = useState<LocationNode[]>([]);
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");

  // Load the whole location hierarchy once
  useEffect(() => {
    fetch("/api/locations/tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDivisions(data.data);
      })
      .catch(() => {
        // Leave the dropdowns empty; field validation will guide the user
      });
  }, []);

  // If a location is already saved (draft / back navigation), restore selects
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
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">অবস্থান ও যোগাযোগ</h2>
        <p className="mt-1 text-sm text-[#6B6656]">
          গ্রাহকরা কীভাবে আপনাকে খুঁজে পাবে ও যোগাযোগ করবে তা জানান।
        </p>
      </div>

      <ControlledField
        control={form.control}
        name="locationId"
        label="এলাকা *"
        description="বিভাগ, জেলা ও উপজেলা — তিনটি ধাপ নির্বাচন করুন"
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
                {/* Division */}
                <Select
                  value={divisionId}
                  onValueChange={handleDivisionChange}
                >
                  <SelectTrigger className={"w-full"}>
                    <SelectValue placeholder="বিভাগ">
                      {selectedDivision?.nameLocal}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem
                        key={division.id}
                        value={division.id}
                      >
                        {division.nameLocal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* District */}
                <Select
                  value={districtId}
                  onValueChange={handleDistrictChange}
                  disabled={!divisionId}
                >
                  <SelectTrigger  className={"w-full"}>
                    <SelectValue placeholder="জেলা">
                      {selectedDistrict?.nameLocal}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem
                        key={district.id}
                        value={district.id}
                      >
                        {district.nameLocal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Upazila */}
                <Select
                  value={field.value || ""}
                  onValueChange={handleUpazilaChange}
                  disabled={!districtId}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                     className={"w-full"}
                  >
                    <SelectValue placeholder="উপজেলা">
                      {selectedUpazila?.nameLocal}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {upazilas.map((upazila) => (
                      <SelectItem
                        key={upazila.id}
                        value={upazila.id}
                      >
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
        label="ঠিকানা লাইন ১ *"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="বাড়ি/রোড নম্বর, এলাকার নাম"
          />
        )}
      />

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <ControlledField
          control={form.control}
          name="phone"
          label="মোবাইল নম্বর *"
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
          label="হোয়াটসঅ্যাপ"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="ঐচ্ছিক"
            />
          )}
        />
        <ControlledField
          control={form.control}
          name="email"
          label="ব্যবসায়িক ইমেইল"
          description="এটি লগইন ইমেইল থেকে ভিন্ন হতে পারে"
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
          label="ওয়েবসাইট"
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
        <h3 className="text-sm font-medium text-[#1A1A1A]">সোশ্যাল মিডিয়া লিংক</h3>
        <p className="mt-1 text-xs text-[#8A8371]">সবগুলো ঐচ্ছিক — যা আছে তা দিন</p>
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
                placeholder={`https://${key}.com/...`}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
}
