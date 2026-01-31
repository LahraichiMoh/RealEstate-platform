"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import BuildingVisualizationEditor from "@/components/admin/BuildingVisualizationEditor";
import ProjectApartmentManager from "@/components/admin/ProjectApartmentManager";

interface ProjectFormData {
  name: string;
  slug: string;
  description: string;
  location: string;
  floorsCount: number;
  buildingImage: string;
  completionPercentage: number;
  model3DUrl?: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading3D, setIsUploading3D] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    slug: "",
    description: "",
    location: "",
    floorsCount: 10,
    buildingImage: "",
    completionPercentage: 0,
    model3DUrl: "",
  });
  
  const [floorsConfig, setFloorsConfig] = useState<{ floorNumber: number; apartmentsCount: number; coordinates?: string }[]>([]);
  const [fullFloors, setFullFloors] = useState<any[]>([]);
  const [defaultApartmentsCount, setDefaultApartmentsCount] = useState(2);

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string);
    }
  }, [params.id]);

  // Sync floorsConfig when floorsCount changes
  useEffect(() => {
    const count = parseInt(formData.floorsCount.toString()) || 0;
    setFloorsConfig(prev => {
      // If no change in count, don't do anything to avoid overwriting fetched data unnecessarily
      // But if count changes, we need to adjust
      if (prev.length === count) return prev;

      const newConfig = [];
      for (let i = 1; i <= count; i++) {
        const existing = prev.find(p => p.floorNumber === i);
        newConfig.push({
          floorNumber: i,
          apartmentsCount: existing ? existing.apartmentsCount : defaultApartmentsCount, // Use default state
          coordinates: existing?.coordinates
        });
      }
      return newConfig;
    });
  }, [formData.floorsCount]); // Remove defaultApartmentsCount dependency to avoid resetting existing values when default changes

  async function fetchProject(id: string) {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      const data = await response.json();
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        location: data.location,
        floorsCount: data.floorsCount,
        completionPercentage: data.completionPercentage || 0,
        buildingImage: data.buildingImage || "",
        model3DUrl: data.model3DUrl || "",
      });

      // Transform fetched floors to config
      if (data.floors && Array.isArray(data.floors)) {
        setFullFloors(data.floors);
        const config = data.floors.map((f: any) => ({
          floorNumber: f.floorNumber,
          apartmentsCount: f.apartments ? f.apartments.length : 0,
          coordinates: f.coordinates
        }));
        // Sort by floor number
        config.sort((a: any, b: any) => a.floorNumber - b.floorNumber);
        setFloorsConfig(config);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
      router.push("/admin/projects");
    } finally {
      setIsLoading(false);
    }
  }

  const handleApartmentCountChange = (floorNumber: number, count: number) => {
    setFloorsConfig(prev => prev.map(f => 
      f.floorNumber === floorNumber ? { ...f, apartmentsCount: count } : f
    ));
  };

  const handleApplyDefaultToAll = () => {
    setFloorsConfig(prev => prev.map(f => ({ ...f, apartmentsCount: defaultApartmentsCount })));
    toast({ title: "Applied", description: `Set ${defaultApartmentsCount} apartments for all floors.` });
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
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          floorsCount: parseInt(formData.floorsCount.toString()),
          completionPercentage: parseInt(formData.completionPercentage.toString()),
          floorsConfig
        }),
      });

      if (!response.ok) throw new Error("Failed to update project");

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      router.push("/admin/projects");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleVisualizationSave = async (image: string, updatedFloors: any[]) => {
    // Only update image and coordinates
    const response = await fetch(`/api/projects/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buildingImage: image,
        floorsConfig: updatedFloors.map(f => ({
          floorNumber: f.floorNumber,
          // We need to preserve apartmentsCount because the API expects it to possibly create/update apartments
          // But since we are only updating coordinates here, we should look it up from current state
          apartmentsCount: floorsConfig.find(fc => fc.floorNumber === f.floorNumber)?.apartmentsCount || 0,
          coordinates: f.coordinates
        }))
      }),
    });

    if (!response.ok) throw new Error("Failed to save visualization");
    
    // Update local state
    setFormData(prev => ({ ...prev, buildingImage: image }));
    setFloorsConfig(prev => prev.map(p => {
        const updated = updatedFloors.find(u => u.floorNumber === p.floorNumber);
        return updated ? { ...p, coordinates: updated.coordinates } : p;
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/projects">
            <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
            </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold">Edit Project</h1>
            <p className="text-muted-foreground">Update project details and visualization</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="visualization">Visualization (3D)</TabsTrigger>
            <TabsTrigger value="apartments">Apartments</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
            <Card className="max-w-2xl mt-6">
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
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                        id="location"
                        required
                        placeholder="123 Main St, City"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={isSubmitting}
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

                    <div className="space-y-2">
                    <Label htmlFor="completionPercentage">Completion Percentage (%)</Label>
                    <Input
                        id="completionPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.completionPercentage}
                        onChange={(e) => setFormData({ ...formData, completionPercentage: parseInt(e.target.value) || 0 })}
                        disabled={isSubmitting}
                    />
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Project description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        disabled={isSubmitting}
                        className="min-h-[100px]"
                    />
                    </div>

                    {floorsConfig.length > 0 && (
                    <div className="space-y-4 border rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Apartments per Floor</h3>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="defaultApts" className="whitespace-nowrap text-sm text-muted-foreground">Set all to:</Label>
                                <Input 
                                    id="defaultApts"
                                    type="number" 
                                    min="1"
                                    className="w-16 h-8"
                                    value={defaultApartmentsCount}
                                    onChange={(e) => setDefaultApartmentsCount(parseInt(e.target.value) || 0)}
                                />
                                <Button type="button" size="sm" variant="secondary" onClick={handleApplyDefaultToAll}>
                                    Apply
                                </Button>
                            </div>
                        </div>
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

                    <div className="flex justify-end gap-4">
                    <Link href="/admin/projects">
                        <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="visualization">
            <Card className="mt-6 mb-6">
                <CardHeader>
                    <CardTitle>3D Model</CardTitle>
                    <CardDescription>Upload a 3D model (.glb or .gltf) for the project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="model3d">3D Model File</Label>
                            <Input id="model3d" type="file" accept=".glb,.gltf" onChange={handle3DUpload} disabled={isUploading3D || isSubmitting} />
                        </div>
                        {formData.model3DUrl && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <span>✓ Model uploaded: {formData.model3DUrl.split('/').pop()}</span>
                            </div>
                        )}
                        {isUploading3D && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Building Visualization (2D)</CardTitle>
                    <CardDescription>
                        Upload a building image and define floor zones. The system can auto-detect floors, which you can then fine-tune.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BuildingVisualizationEditor 
                        projectId={params.id as string}
                        initialImage={formData.buildingImage}
                        floors={floorsConfig}
                        onSave={handleVisualizationSave}
                    />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="apartments">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Manage Apartments</CardTitle>
                    <CardDescription>Edit details, prices, and media for each apartment unit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProjectApartmentManager 
                      floors={fullFloors} 
                      onApartmentUpdate={() => fetchProject(params.id as string)} 
                    />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
