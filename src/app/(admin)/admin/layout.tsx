"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuthStore, useUIStore } from "@/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
