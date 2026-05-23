"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("lp_token")) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[oklch(0.97_0.006_264)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
