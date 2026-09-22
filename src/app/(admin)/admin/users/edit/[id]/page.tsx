"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import type { AdminUserDetailResponse } from "@/app/api/admin/users/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm } from "../../components/user-form";

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = React.useState<
    AdminUserDetailResponse["data"] | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/users/${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data: AdminUserDetailResponse) => {
        if (cancelled) return;

        if (!data.success || !data.data) {
          setError(data.message ?? "Failed to load user");
          return;
        }

        setDetail(data.data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load user");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
      router.push("/admin/users");
    }, 900);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit"
          render={<Link href="/admin/users" />}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to users
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <span className="flex items-center gap-2">
              <Pencil className="size-4" />
              Edit user
            </span>

            {detail && (
              <span className="ml-auto flex items-center gap-2 text-sm font-normal text-muted-foreground">
                <Avatar className="size-6">
                  {detail.image ? (
                    <AvatarImage src={detail.image} alt="" />
                  ) : (
                    <AvatarFallback className="text-[10px]">
                      {getInitials(detail.name || detail.email)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {detail.name}
                {detail.isVerified && <Badge>Verified</Badge>}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        {loading ? (
          <CardContent className="space-y-4 pt-5">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        ) : error ? (
          <CardContent className="pt-5">
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          </CardContent>
        ) : (
          <CardContent className="pt-5">
            <UserForm
              mode="edit"
              userId={id}
              initialData={detail}
              onSaved={showToast}
            />
          </CardContent>
        )}
      </Card>

      {toast && (
        <div className="fixed right-4 bottom-4 z-50 rounded-lg border bg-card px-4 py-3 text-sm shadow-lg">
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
