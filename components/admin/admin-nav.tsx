"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Building2, Home, LogOut, Users, Settings } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user as any)?.role;

  const superAdminItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  const clientItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/projects", label: "Projects", icon: Building2 },
    { href: "/admin/team", label: "Team", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const navItems = userRole === "SUPER_ADMIN" ? superAdminItems : clientItems;

  return (
    <nav className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold">Real Estate Admin</h1>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => signOut({ redirectTo: "/admin/login" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
