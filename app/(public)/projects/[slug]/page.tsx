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

  // Auto-select first available floor on load
  useEffect(() => {
    if (project && !selectedFloorId) {
      const floorWithAvailable = project.floors.find((floor) =>
        floor.apartments.some((apt) => apt.status === "AVAILABLE")
      );
      if (floorWithAvailable) {
        setSelectedFloorId(floorWithAvailable.id);
      } else if (project.floors.length > 0) {
        setSelectedFloorId(project.floors[0].id);
      }
    }
  }, [project, selectedFloorId]);

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
          </div>

          {/* Tabs for Filters and Apartments */}
          <Tabs defaultValue="apartments" className="w-full">
            <TabsList>
              <TabsTrigger value="apartments">Apartments</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="apartments" className="space-y-4 mt-6">
              {selectedFloor && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedFloor.label || `Floor ${selectedFloor.floorNumber}`}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedFloor.apartments.map((apt) => (
                      <Card
                        key={apt.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedApartmentId(apt.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">Apartment {apt.number}</CardTitle>
                          <CardDescription>
                            {apt.rooms} rooms • {apt.area} m²
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">
                              ${apt.price.toLocaleString()}
                            </div>
                            <div>
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
