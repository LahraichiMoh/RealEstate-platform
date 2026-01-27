import React from "react"
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/admin-nav";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Admin Dashboard",
  description: "Real Estate Platform Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
