"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Domain {
  id: string;
  domain: string;
  isPrimary: boolean;
  status: string;
  createdAt: string;
}

export default function DomainsPage() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  async function fetchDomains() {
    try {
      const response = await fetch("/api/domains");
      if (!response.ok) throw new Error("Failed to fetch domains");
      const data = await response.json();
      setDomains(data);
    } catch (error) {
      toast.error("Failed to load domains");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDomain(id: string) {
    try {
      setDeleting(id);
      const response = await fetch(`/api/domains/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete domain");
      setDomains(domains.filter((d) => d.id !== id));
      toast.success("Domain removed");
    } catch (error) {
      toast.error("Failed to remove domain");
    } finally {
      setDeleting(null);
    }
  }

  async function setPrimary(id: string) {
    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!response.ok) throw new Error("Failed to update domain");
      fetchDomains();
      toast.success("Primary domain updated");
    } catch (error) {
      toast.error("Failed to update domain");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/admin/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Domains</h1>
          </div>
          <p className="text-muted-foreground">Manage your custom domains</p>
        </div>
        <Link href="/admin/domains/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No domains yet</p>
              <Link href="/admin/domains/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Domain
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{domain.domain}</h3>
                      <div className="flex items-center gap-2">
                        {domain.isPrimary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getStatusIcon(domain.status)}
                          {domain.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(domain.createdAt).toLocaleDateString()}
                    </p>

                    {domain.status === "PENDING" && (
                      <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>Waiting for verification.</strong> Add this CNAME record to your domain DNS settings:
                        </p>
                        <code className="block mt-2 p-2 bg-white rounded text-xs font-mono border">
                          {domain.domain} CNAME verify.yoursite.com
                        </code>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!domain.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(domain.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDomain(domain.id)}
                      disabled={deleting === domain.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>DNS Setup Instructions</CardTitle>
          <CardDescription>How to connect your domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Copy your domain</h4>
            <p className="text-sm text-muted-foreground">
              Enter your domain name above and click "Add Domain"
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Add CNAME Record</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Log into your domain registrar (Godaddy, Namecheap, etc.) and add this CNAME record:
            </p>
            <code className="block p-2 bg-muted rounded text-xs font-mono">
              CNAME verify.yoursite.com
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">3. Wait for Verification</h4>
            <p className="text-sm text-muted-foreground">
              Your domain status will change to "VERIFIED" once the DNS record is confirmed (usually within 24 hours)
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">4. Set as Primary</h4>
            <p className="text-sm text-muted-foreground">
              Once verified, click "Set Primary" to make it your main domain
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
