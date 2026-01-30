"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bed, Square, DollarSign, Image as ImageIcon } from "lucide-react";
import ReservationForm from "./reservation-form";
import Image from "next/image";

interface Apartment {
  id: string;
  number: string;
  rooms: number;
  area: number;
  price: number;
  status: string;
  floorId: string;
  planImage?: string | null;
  plan3dImage?: string | null;
  images?: string | null;
}

interface ApartmentDetailsModalProps {
  apartment: Apartment;
  projectId: string;
  onClose: () => void;
}

export default function ApartmentDetailsModal({
  apartment,
  projectId,
  onClose,
}: ApartmentDetailsModalProps) {
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");

  let galleryImages: string[] = [];
  try {
    if (apartment.images) {
      galleryImages = JSON.parse(apartment.images);
    }
  } catch (e) {
    console.error("Failed to parse gallery images", e);
  }

  // Determine which main image to show
  const has2D = !!apartment.planImage;
  const has3D = !!apartment.plan3dImage;
  
  // Auto-switch if only one is available
  if (!has2D && has3D && viewMode === "2D") setViewMode("3D");
  if (has2D && !has3D && viewMode === "3D") setViewMode("2D");

  const currentMainImage = viewMode === "2D" ? apartment.planImage : apartment.plan3dImage;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Apartment {apartment.number}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">Details & Gallery</TabsTrigger>
            <TabsTrigger value="reserve">Reserve</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Top Section: Plan & Basic Info */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Visualization */}
              <div className="space-y-4">
                <div className="relative aspect-square md:aspect-[4/3] bg-slate-50 rounded-lg border overflow-hidden flex items-center justify-center">
                  {currentMainImage ? (
                    <Image 
                      src={currentMainImage} 
                      alt={`Apartment ${apartment.number} ${viewMode} Plan`}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                      <p>No {viewMode} plan available</p>
                    </div>
                  )}

                  {/* Toggle Controls */}
                  {(has2D || has3D) && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex bg-white/90 backdrop-blur border rounded-full p-1 shadow-sm">
                      <button
                        onClick={() => setViewMode("2D")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          viewMode === "2D" 
                            ? "bg-teal-400 text-white shadow-sm" 
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        disabled={!has2D}
                      >
                        2D
                      </button>
                      <button
                        onClick={() => setViewMode("3D")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          viewMode === "3D" 
                            ? "bg-teal-400 text-white shadow-sm" 
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        disabled={!has3D}
                      >
                        3D
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Stats & Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Bed className="w-4 h-4" /> Rooms
                    </div>
                    <p className="text-2xl font-bold">{apartment.rooms}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Square className="w-4 h-4" /> Area
                    </div>
                    <p className="text-2xl font-bold">{apartment.area} m²</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" /> Price
                    </div>
                    <p className="text-3xl font-bold text-teal-600">
                      {apartment.price.toLocaleString()} MAD
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.round(apartment.price / apartment.area).toLocaleString()} MAD / m²
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Status</h3>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        apartment.status === "AVAILABLE"
                          ? "bg-green-500"
                          : apartment.status === "RESERVED"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="font-medium">{apartment.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-slate-100 group">
                      <Image 
                        src={img} 
                        alt={`Gallery image ${idx + 1}`} 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reserve" className="mt-6">
            <ReservationForm apartment={apartment} projectId={projectId} onSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
