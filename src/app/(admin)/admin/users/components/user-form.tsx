"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Save, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { AdminUserDetail } from "@/app/api/admin/users/types";
import { Button } from "@/components/ui/button";
import { ControlledField } from "@/components/ui/controlled-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  type AdminUserFormValues,
  adminUserFormSchema,
} from "@/lib/schemas/admin-user-schema";
import { cn } from "@/lib/utils";

type UserFormProps = {
  mode: "create" | "edit";
  initialData?: AdminUserDetail | null;
  userId?: string;
  onSaved: (message: string) => void;
};

const defaultValues: AdminUserFormValues = {
  name: "",
  email: "",
  phone: "",
  role: "USER",
  status: "ACTIVE",
  isVerified: false,
  password: "",
  image: null,
};

export function UserForm({
  mode,
  initialData,
  userId,
  onSaved,
}: UserFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues,
  });

  const imageValue = form.watch("image");
  const imagePreview =
    imageValue instanceof File ? URL.createObjectURL(imageValue) : null;
  const existingImageUrl =
    !removeImage && !imageValue ? (initialData?.image ?? null) : null;

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone ?? "",
        role: initialData.role,
        status: initialData.status,
        isVerified: initialData.isVerified,
        password: "",
        image: null,
      });
      setRemoveImage(false);
    }
  }, [initialData, form]);

  async function onSubmit(values: AdminUserFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    if (mode === "create" && !values.password) {
      form.setError("password", {
        type: "manual",
        message: "A password is required for a new user",
      });
      setSubmitting(false);
      return;
    }

    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("email", values.email);

    if (values.phone) {
      formData.append("phone", values.phone);
    }

    formData.append("role", values.role);
    formData.append("status", values.status);
    formData.append("isVerified", String(values.isVerified ?? false));

    if (values.password) {
      formData.append("password", values.password);
    }

    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    if (removeImage) {
      formData.append("removeImage", "true");
    }

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/users" : `/api/admin/users/${userId}`,
        { method: mode === "create" ? "POST" : "PATCH", body: formData },
      );

      const data = (await res.json()) as { success: boolean; message?: string };

      if (!data.success) {
        setSubmitError(data.message ?? "Something went wrong");
        return;
      }

      onSaved(data.message ?? "User saved successfully");
    } catch {
      setSubmitError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ControlledField
          control={form.control}
          name="name"
          label="Full name *"
          description="Shown across the site and in listings."
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g. Rahim Uddin"
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="email"
          label="Email address *"
          description="Used to sign in — must be unique."
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              type="email"
              aria-invalid={fieldState.invalid}
              placeholder="rahim@example.com"
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="phone"
          label="Phone number"
          description="Optional contact number."
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="+8801XXXXXXXXX"
            />
          )}
        />

        <ControlledField
          control={form.control}
          name="password"
          label={mode === "create" ? "Password *" : "Reset password"}
          description={
            mode === "create"
              ? "Used to sign in to the account."
              : "Leave blank to keep the current password."
          }
          render={({ field, fieldState }) => (
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder={
                mode === "create" ? "At least 6 characters" : "••••••••"
              }
            />
          )}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ControlledField
          control={form.control}
          name="role"
          label="Role"
          description="Controls what the user is allowed to do."
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <ControlledField
          control={form.control}
          name="status"
          label="Status"
          description="A blocked user cannot sign in anymore."
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <ControlledField
        control={form.control}
        name="isVerified"
        label="Email verified"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
            <span className="text-sm text-muted-foreground">
              {field.value ? "Verified account" : "Not verified yet"}
            </span>
          </div>
        )}
      />

      <ControlledField
        control={form.control}
        name="image"
        label="Profile picture"
        description="Optional avatar — uploaded and stored securely."
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            {existingImageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                {/* biome-ignore lint/performance/noImgElement: user avatar thumbnail */}
                <img
                  src={existingImageUrl}
                  alt=""
                  className="h-32 w-32 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setRemoveImage(true)}
                  className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-black/80"
                >
                  <Trash2 className="size-3.5" />
                  Remove picture
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted",
                  fieldState.invalid && "border-destructive/60",
                )}
              >
                <label
                  htmlFor="user-image-file"
                  className="flex w-full cursor-pointer items-center justify-center"
                >
                  {imagePreview ? (
                    // biome-ignore lint/performance/noImgElement: selected file preview
                    <img
                      src={imagePreview}
                      alt=""
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-32 flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <ImagePlus className="size-6" />
                      <span className="text-xs">Click to upload a picture</span>
                    </div>
                  )}
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => field.onChange(null)}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                    aria-label="Remove selected image"
                  >
                    <X className="size-3.5" />
                  </button>
                )}

                <input
                  id="user-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    field.onChange(file);
                    if (file) {
                      setRemoveImage(false);
                    }
                    event.target.value = "";
                  }}
                />
              </div>
            )}
          </div>
        )}
      />

      {submitError && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : mode === "create" ? (
            <UserPlus className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === "create" ? "Create user" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
