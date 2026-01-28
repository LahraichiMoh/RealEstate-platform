"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const clientSettings = [
    {
      icon: Globe,
      title: "Domains",
      description: "Manage your custom domains",
      href: "/admin/domains",
    },
    {
      icon: Users,
      title: "Team Members",
      description: "Manage your team",
      href: "/admin/team",
    },
  ];

  const superAdminSettings = [
    {
      icon: Shield,
      title: "Clients",
      description: "Manage all clients and their access",
      href: "/admin/clients",
    },
  ];

  const settingsList =
    userRole === "SUPER_ADMIN" ? superAdminSettings : clientSettings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and settings</p>
      </div>

      <div className="grid gap-4">
        {settingsList.map((setting) => {
          const Icon = setting.icon;
          return (
            <Link key={setting.href} href={setting.href}>
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg h-fit">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{setting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => signOut({ redirectTo: "/admin/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
