"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { domainSchema, type DomainInput } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewDomainPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DomainInput>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
      isPrimary: false,
    },
  });

  async function onSubmit(values: DomainInput) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add domain");
      }

      toast.success("Domain added successfully!");
      router.push("/admin/domains");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add domain");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/domains">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Domain</h1>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Domain Configuration</CardTitle>
            <CardDescription>Connect your custom domain to your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your full domain (e.g., prestige.com or projects.mycompany.com)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="cursor-pointer">Set as primary domain</FormLabel>
                        <FormDescription>
                          Your primary domain will be used for public project access
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Domain"}
                  </Button>
                  <Link href="/admin/domains">
                    <Button variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-1">1. Add DNS Record</p>
              <p className="text-muted-foreground">
                After adding your domain, you'll receive a CNAME record to add to your domain registrar
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">2. Wait for Verification</p>
              <p className="text-muted-foreground">
                DNS changes typically take 24-48 hours to propagate
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">3. Domain Ready</p>
              <p className="text-muted-foreground">
                Once verified, your projects will be accessible at your domain
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
