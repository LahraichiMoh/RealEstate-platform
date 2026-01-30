"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin } from "lucide-react";
import { Building2DFallback } from "@/components/3d/building-scene";
import ApartmentDetailsModal from "@/components/public/apartment-details-modal";
import ApartmentFiltersModern from "@/components/public/apartment-filters-modern";
import ApartmentListItem from "@/components/public/apartment-list-item";
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
  completionPercentage: number;
  floors: Floor[];
}

export default function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { slug } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    selectedFloor: null as number | null,
    selectedRooms: null as number | null,
    minPrice: 0,
    maxPrice: 10000000,
    hasTerrace: false,
    isCommercial: false,
  });

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
      
      // Initialize price range from data
      if (data && data.floors) {
        const allApartments = data.floors.flatMap((f: Floor) => f.apartments);
        if (allApartments.length > 0) {
          const prices = allApartments.map((a: Apartment) => a.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setFilters(prev => ({
            ...prev,
            minPrice: min,
            maxPrice: max,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Derived data for filters
  const { floorNumbers, priceRange } = useMemo(() => {
    if (!project) return { floorNumbers: [], priceRange: [0, 10000000] as [number, number] };
    
    const floors = project.floors.map(f => f.floorNumber).sort((a, b) => a - b);
    const allApartments = project.floors.flatMap(f => f.apartments);
    
    let min = 0;
    let max = 10000000;
    
    if (allApartments.length > 0) {
      const prices = allApartments.map(a => a.price);
      min = Math.min(...prices);
      max = Math.max(...prices);
    }
    
    return { floorNumbers: floors, priceRange: [min, max] as [number, number] };
  }, [project]);

  const stats = useMemo(() => {
    if (!project) return { sales: 0, built: 0 };
    
    const allApartments = project.floors.flatMap(f => f.apartments);
    const total = allApartments.length;
    const sold = allApartments.filter(a => a.status === 'SOLD' || a.status === 'RESERVED').length;
    
    return {
      sales: total > 0 ? Math.round((sold / total) * 100) : 0,
      built: project.completionPercentage || 0
    };
  }, [project]);

  const handleClearFilters = () => {
    setFilters({
      selectedFloor: null,
      selectedRooms: null,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      hasTerrace: false,
      isCommercial: false,
    });
    setSelectedFloorId(null);
  };

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

  // Filter logic
  const displayedFloors = project.floors
    .sort((a, b) => a.floorNumber - b.floorNumber)
    .filter(floor => {
      // Filter by floor number if selected
      if (filters.selectedFloor !== null && floor.floorNumber !== filters.selectedFloor) {
        return false;
      }
      return true;
    })
    .map(floor => {
      // Filter apartments within the floor
      const filteredApartments = floor.apartments.filter(apt => {
        // Rooms filter
        if (filters.selectedRooms !== null && apt.rooms !== filters.selectedRooms) {
          return false;
        }
        // Price filter
        if (apt.price < filters.minPrice || apt.price > filters.maxPrice) {
          return false;
        }
        // Commercial filter (assuming status or type check - using mock logic for now as 'isCommercial' isn't in schema yet)
        // If 'isCommercial' is true, we might filter by type if it existed. For now, ignoring or adding placeholder logic.
        
        // Terrace filter (placeholder logic as 'hasTerrace' isn't in schema yet)
        
        return true;
      });
      
      return {
        ...floor,
        apartments: filteredApartments
      };
    })
    // Only show floors that have matching apartments (optional: currently showing empty floors if they match floor filter)
    // .filter(floor => floor.apartments.length > 0); 

  return (
    <main className="min-h-screen bg-background">
      {/* Header - Hidden
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
      */}

      {/* 3D Building View - Full Width */}
      <section className="w-full bg-slate-50 border-b">
        {project.buildingImage ? (
            <BuildingImageInteractive 
                image={project.buildingImage}
                floors={project.floors}
                selectedFloorId={selectedFloorId}
                onFloorSelect={(id) => {
                    setSelectedFloorId(id);
                    // Optional: Sync filter floor selection
                    const floor = project.floors.find(f => f.id === id);
                    if (floor) {
                        setFilters(prev => ({ ...prev, selectedFloor: floor.floorNumber }));
                    }
                }}
                className=""
                salesPercentage={stats.sales}
                builtPercentage={stats.built}
            />
        ) : (
            <div className="w-full aspect-video bg-gradient-to-b from-sky-100 to-slate-50 overflow-hidden relative">
                <Suspense fallback={<Building2DFallback floors={project.floors} selectedFloorId={selectedFloorId ?? undefined} onFloorClick={setSelectedFloorId} onApartmentClick={setSelectedApartmentId} />}>
                    {typeof window !== "undefined" && "WebGL" in window ? (
                    <BuildingScene
                        floors={project.floors}
                        selectedFloorId={selectedFloorId ?? undefined}
                        onFloorClick={setSelectedFloorId}
                        onApartmentClick={setSelectedApartmentId}
                    />
                    ) : (
                    <Building2DFallback
                        floors={project.floors}
                        selectedFloorId={selectedFloorId ?? undefined}
                        onFloorClick={setSelectedFloorId}
                        onApartmentClick={setSelectedApartmentId}
                    />
                    )}
                </Suspense>
            </div>
        )}
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 md:px-8">
        <div className="w-full space-y-6">
          
          {/* New Modern Filters */}
          <ApartmentFiltersModern 
            filters={filters}
            priceRange={priceRange}
            floors={floorNumbers}
            onFiltersChange={setFilters}
            onClear={handleClearFilters}
          />

          {/* Apartments List */}
          <div className="bg-slate-50 rounded-xl overflow-hidden shadow-sm border">
            {displayedFloors.flatMap(f => f.apartments).length > 0 ? (
              displayedFloors
                .flatMap(floor => 
                  floor.apartments.map(apt => ({
                    ...apt,
                    floorNumber: floor.floorNumber
                  }))
                )
                // Sort by floor number ascending (1, 2, 3...) as requested
                .sort((a, b) => (a.floorNumber || 0) - (b.floorNumber || 0))
                .map((apt, index) => (
                  <ApartmentListItem
                    key={apt.id}
                    apartment={apt}
                    onClick={() => setSelectedApartmentId(apt.id)}
                    className={index % 2 === 0 ? "bg-[#f4f4f5]" : "bg-white"}
                  />
                ))
            ) : (
              <div className="text-center py-12 bg-white">
                <p className="text-muted-foreground text-lg mb-4">No apartments match your criteria.</p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
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
