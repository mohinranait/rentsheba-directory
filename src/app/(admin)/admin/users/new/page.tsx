"use client";

import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserForm } from "../components/user-form";

export default function NewUserPage() {
  const router = useRouter();
  const [toast, setToast] = React.useState<string | null>(null);

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
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4" />
            Add new user
          </CardTitle>
        </CardHeader>

        <Separator />

        <CardContent className="pt-5">
          <UserForm mode="create" onSaved={showToast} />
        </CardContent>
      </Card>

      {toast && (
        <div className="fixed right-4 bottom-4 z-50 rounded-lg border bg-card px-4 py-3 text-sm shadow-lg">
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
