import type { ReactNode } from "react";
import { AdminHeader } from "@/components/ui/admin-header";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset>
        <AdminHeader />

        <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col bg-muted/20">
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}