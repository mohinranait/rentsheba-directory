import {
  ArrowUpRight,
  Building2,
  Clock3,
  Plus,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    title: "Total Listings",
    value: "1,248",
    change: "+12.5%",
    icon: Building2,
  },
  {
    title: "Pending Review",
    value: "12",
    change: "+3.2%",
    icon: Clock3,
  },
  {
    title: "Total Users",
    value: "2,845",
    change: "+18.4%",
    icon: Users,
  },
  {
    title: "Featured Listings",
    value: "86",
    change: "+24.8%",
    icon: Star,
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Good evening, Ebrahim 👋
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with Rentsheba today.
          </p>
        </div>

        <Button>
          <Plus />
          Add New Listing
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="shadow-none"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <ArrowUpRight className="size-3.5" />
                    {stat.change}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Listings Overview
                </h2>

                <p className="text-sm text-muted-foreground">
                  Listing activity over the last 30 days.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
              >
                30 Days
              </Button>
            </div>

            <div className="mt-8 flex h-64 items-end gap-2">
              {[35, 48, 42, 64, 58, 72, 66, 81, 75, 92, 86, 100].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex flex-1 items-end"
                  >
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>
                ),
              )}
            </div>

            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>Aug 20</span>
              <span>Aug 25</span>
              <span>Aug 30</span>
              <span>Sep 5</span>
              <span>Sep 17</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <h2 className="font-semibold">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your platform quickly.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button
                variant="outline"
                className="h-auto justify-start gap-3 p-4"
              >
                <Building2 className="size-5 text-primary" />

                <div className="text-left">
                  <p className="text-sm font-medium">
                    Review Listings
                  </p>
                  <p className="text-xs text-muted-foreground">
                    12 listings pending
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto justify-start gap-3 p-4"
              >
                <Plus className="size-5 text-primary" />

                <div className="text-left">
                  <p className="text-sm font-medium">
                    Add Category
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create a new category
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto justify-start gap-3 p-4"
              >
                <Users className="size-5 text-primary" />

                <div className="text-left">
                  <p className="text-sm font-medium">
                    Manage Users
                  </p>
                  <p className="text-xs text-muted-foreground">
                    View platform users
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}