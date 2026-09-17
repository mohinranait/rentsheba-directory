"use client";

import * as React from "react";
import {
  type Control,
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

interface ControlledFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
  render: (args: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
  }) => React.ReactNode;
}

/**
 * shadcn/ui's newer <Field> primitives are layout-only and decoupled from
 * any form library (see https://ui.shadcn.com/docs/components/field).
 * This wraps react-hook-form's <Controller> around Field / FieldLabel /
 * FieldDescription / FieldError so step components stay short — the same
 * job the old <FormField>/<FormItem> wrapper used to do.
 */
export function ControlledField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  className,
  orientation,
  render,
}: ControlledFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid || undefined} className={className} orientation={orientation}>
          {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
          {render({ field, fieldState })}
          {description && !fieldState.invalid && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
