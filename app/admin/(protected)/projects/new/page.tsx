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
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading3D, setIsUploading3D] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    floorsCount: 10,
    model3DUrl: "",
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

  const handle3DUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      toast({ title: "Error", description: "Please upload a GLB or GLTF file", variant: "destructive" });
      return;
    }

    setIsUploading3D(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      setFormData(prev => ({ ...prev, model3DUrl: data.url }));
      toast({ title: "Success", description: "3D model uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload 3D model", variant: "destructive" });
    } finally {
      setIsUploading3D(false);
    }
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
              <Label htmlFor="model3d">3D Model / Visualization</Label>
              <Input
                id="model3d"
                type="file"
                accept=".glb,.gltf,.jpg,.jpeg,.png,.webp"
                onChange={handle3DUpload}
                disabled={isUploading3D || isSubmitting}
              />
              {formData.model3DUrl && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span>✓ File uploaded: {formData.model3DUrl.split('/').pop()}</span>
                </div>
              )}
              {isUploading3D && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Upload a 3D model (.glb, .gltf) or an image (.jpg, .png) for visualization.
              </p>
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
