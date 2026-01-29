"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Building2DFallback } from "@/components/3d/building-scene";
import ApartmentDetailsModal from "@/components/public/apartment-details-modal";
import ApartmentFilters from "@/components/public/apartment-filters";

import BuildingImageInteractive from "@/components/public/BuildingImageInteractive";

const BuildingScene = dynamic(
  () => import("@/components/3d/building-scene").then((mod) => mod.BuildingScene),
  { ssr: false, loading: () => <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">Loading 3D view...</div> }
);

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

interface Floor {
  id: string;
  floorNumber: number;
  label: string | null;
  coordinates?: string | null;
  apartments: Apartment[];
}

interface Apartment {
  id: string;
  number: string;
  rooms: number;
  area: number;
  price: number;
  status: string;
  floorId: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string;
  coverImage: string | null;
  buildingImage: string | null;
  floorsCount: number;
  floors: Floor[];
}

export default function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { slug } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    minRooms: 0,
    maxRooms: 10,
    minPrice: 0,
    maxPrice: 10000000,
    minArea: 0,
    maxArea: 1000,
  });
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProject();
  }, [slug]);

  // Scroll to selected floor
  useEffect(() => {
    if (selectedFloorId) {
      const element = document.getElementById(`floor-${selectedFloorId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedFloorId]);

  async function fetchProject() {
    try {
      const response = await fetch(`/api/projects/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const selectedFloor = project.floors.find((f) => f.id === selectedFloorId);
  const selectedApartment = project.floors
    .flatMap((f) => f.apartments)
    .find((a) => a.id === selectedApartmentId);

  // Filter apartments
  const filteredApartments = project.floors
    .flatMap((floor) =>
      floor.apartments.map((apt) => ({ ...apt, floor }))
    )
    .filter((apt) => {
      if (filters.status && apt.status !== filters.status) return false;
      if (apt.rooms < filters.minRooms || apt.rooms > filters.maxRooms) return false;
      if (apt.price < filters.minPrice || apt.price > filters.maxPrice) return false;
      if (apt.area < filters.minArea || apt.area > filters.maxArea) return false;
      return true;
    });

  const bestMatchingFloor = filteredApartments.length > 0
    ? filteredApartments[0].floor.id
    : selectedFloorId;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 px-4 md:px-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
          <div className="flex items-center gap-4 text-slate-200">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{project.location}</span>
          </div>
          {project.description && (
            <p className="mt-4 text-slate-300 max-w-2xl">{project.description}</p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 3D Building View */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {project.buildingImage ? (
                <BuildingImageInteractive 
                    image={project.buildingImage}
                    floors={project.floors}
                    selectedFloorId={selectedFloorId || bestMatchingFloor}
                    onFloorSelect={setSelectedFloorId}
                />
            ) : (
                <div className="aspect-video bg-gradient-to-b from-sky-100 to-slate-50 rounded-lg overflow-hidden">
                    <Suspense fallback={<Building2DFallback floors={project.floors} selectedFloorId={selectedFloorId ?? undefined} onFloorClick={setSelectedFloorId} onApartmentClick={setSelectedApartmentId} />}>
                        {typeof window !== "undefined" && "WebGL" in window ? (
                        <BuildingScene
                            floors={project.floors}
                            selectedFloorId={(selectedFloorId || bestMatchingFloor) ?? undefined}
                            onFloorClick={setSelectedFloorId}
                            onApartmentClick={setSelectedApartmentId}
                        />
                        ) : (
                        <Building2DFallback
                            floors={project.floors}
                            selectedFloorId={(selectedFloorId || bestMatchingFloor) ?? undefined}
                            onFloorClick={setSelectedFloorId}
                            onApartmentClick={setSelectedApartmentId}
                        />
                        )}
                    </Suspense>
                </div>
            )}
          </div>

          {/* Tabs for Filters and Apartments */}
          <Tabs defaultValue="apartments" className="w-full">
            <TabsList>
              <TabsTrigger value="apartments">Apartments</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="apartments" className="space-y-8 mt-6">
              {project.floors
                .sort((a, b) => a.floorNumber - b.floorNumber)
                .map((floor) => (
                <div key={floor.id} id={`floor-${floor.id}`} className={`scroll-mt-24 transition-colors duration-500 p-4 rounded-xl ${selectedFloorId === floor.id ? 'bg-blue-50/50 ring-1 ring-blue-100' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                      {floor.label || `Floor ${floor.floorNumber}`}
                    </h2>
                    {selectedFloorId === floor.id && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  
                  {floor.apartments.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {floor.apartments.map((apt) => (
                          <Card
                            key={apt.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow group"
                            onClick={() => setSelectedApartmentId(apt.id)}
                          >
                            <CardHeader>
                              <CardTitle className="text-lg flex justify-between items-start">
                                <span>Apartment {apt.number}</span>
                              </CardTitle>
                              <CardDescription>
                                {apt.rooms} rooms • {apt.area} m²
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="text-2xl font-bold text-primary">
                                  ${apt.price.toLocaleString()}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      apt.status === "AVAILABLE"
                                        ? "bg-green-100 text-green-800"
                                        : apt.status === "RESERVED"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {apt.status}
                                  </span>
                                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                    View Details →
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No apartments listed for this floor.</p>
                    </div>
                  )}
                </div>
              ))}
              
              {project.floors.length === 0 && (
                 <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No floors configured for this project.</p>
                 </div>
              )}
            </TabsContent>

            <TabsContent value="filters" className="mt-6">
              <ApartmentFilters filters={filters} onFiltersChange={setFilters} />
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Matching Apartments ({filteredApartments.length})</h3>
                <div className="space-y-2">
                  {filteredApartments.map((apt) => (
                    <Card
                      key={apt.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setSelectedFloorId(apt.floor.id);
                        setSelectedApartmentId(apt.id);
                      }}
                    >
                      <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {apt.floor.label || `Floor ${apt.floor.floorNumber}`} - Apt {apt.number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {apt.rooms} rooms • {apt.area} m² • ${apt.price.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            apt.status === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : apt.status === "RESERVED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Apartment Details Modal */}
      {selectedApartment && (
        <ApartmentDetailsModal
          apartment={selectedApartment}
          projectId={project.id}
          onClose={() => setSelectedApartmentId(null)}
        />
      )}
    </main>
  );
}
