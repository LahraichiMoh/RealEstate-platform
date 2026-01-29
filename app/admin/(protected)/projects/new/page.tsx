"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    floorsCount: 10,
  });

  const [floorsConfig, setFloorsConfig] = useState<{ floorNumber: number; apartmentsCount: number }[]>([]);

  useEffect(() => {
    const count = parseInt(formData.floorsCount.toString()) || 0;
    setFloorsConfig(prev => {
      const newConfig = [];
      for (let i = 1; i <= count; i++) {
        const existing = prev.find(p => p.floorNumber === i);
        newConfig.push({
          floorNumber: i,
          apartmentsCount: existing ? existing.apartmentsCount : 2 // Default to 2 apartments
        });
      }
      return newConfig;
    });
  }, [formData.floorsCount]);

  const handleApartmentCountChange = (floorNumber: number, count: number) => {
    setFloorsConfig(prev => prev.map(f => 
      f.floorNumber === floorNumber ? { ...f, apartmentsCount: count } : f
    ));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          floorsCount: parseInt(formData.floorsCount.toString()),
          floorsConfig
        }),
      });

      if (!response.ok) throw new Error("Failed to create project");

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      router.push("/admin/projects");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <Link href="/admin/projects">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">Add a new real estate project to the platform</p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                required
                placeholder="Luxury Residences Downtown"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                required
                placeholder="luxury-residences-downtown"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                URL-friendly identifier (e.g., luxury-residences-downtown)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                required
                placeholder="Downtown District, City Center"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A premium residential development..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorsCount">Number of Floors *</Label>
              <Input
                id="floorsCount"
                type="number"
                min="1"
                required
                value={formData.floorsCount}
                onChange={(e) => setFormData({ ...formData, floorsCount: parseInt(e.target.value) || 0 })}
                disabled={isSubmitting}
              />
            </div>

            {floorsConfig.length > 0 && (
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-medium">Apartments per Floor</h3>
                <div className="grid grid-cols-2 gap-4">
                  {floorsConfig.map((floor) => (
                    <div key={floor.floorNumber} className="space-y-1">
                      <Label htmlFor={`floor-${floor.floorNumber}`}>Floor {floor.floorNumber}</Label>
                      <Input
                        id={`floor-${floor.floorNumber}`}
                        type="number"
                        min="0"
                        value={floor.apartmentsCount}
                        onChange={(e) => handleApartmentCountChange(floor.floorNumber, parseInt(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
              <Link href="/admin/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
