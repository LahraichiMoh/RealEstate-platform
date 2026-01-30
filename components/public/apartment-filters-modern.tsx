"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApartmentFiltersModernProps {
  filters: {
    selectedFloor: number | null;
    selectedRooms: number | null;
    minPrice: number;
    maxPrice: number;
    hasTerrace: boolean;
    isCommercial: boolean;
  };
  priceRange: [number, number]; // [min, max] available in data
  floors: number[]; // Available floor numbers
  onFiltersChange: (filters: any) => void;
  onClear: () => void;
}

export default function ApartmentFiltersModern({
  filters,
  priceRange,
  floors,
  onFiltersChange,
  onClear,
}: ApartmentFiltersModernProps) {
  // Common rooms options based on design
  const roomOptions = [1, 2, 3, 4, 5];

  const handleFloorSelect = (floor: number) => {
    onFiltersChange({
      ...filters,
      selectedFloor: filters.selectedFloor === floor ? null : floor,
    });
  };

  const handleRoomSelect = (rooms: number) => {
    onFiltersChange({
      ...filters,
      selectedRooms: filters.selectedRooms === rooms ? null : rooms,
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR').replace(/,/g, ' ');
  };

  return (
    <div className="w-full bg-white px-4 md:px-8 py-6">
      <div className="flex flex-wrap items-center justify-between gap-8">
        {/* Floors Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Haut</span>
          <div className="flex items-center gap-2">
            {floors.sort((a, b) => a - b).map((floor) => (
              <button
                key={floor}
                onClick={() => handleFloorSelect(floor)}
                className={cn(
                  "w-8 h-10 text-xl font-medium transition-colors hover:text-teal-500",
                  filters.selectedFloor === floor
                    ? "text-black font-bold scale-110"
                    : "text-slate-400"
                )}
              >
                {floor}
              </button>
            ))}
            {floors.length === 0 && <span className="text-sm text-slate-400">No floors</span>}
          </div>
        </div>

        {/* Rooms Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Chambres</span>
          <div className="flex items-center gap-4">
            {roomOptions.map((rooms) => (
              <button
                key={rooms}
                onClick={() => handleRoomSelect(rooms)}
                className={cn(
                  "text-2xl font-medium transition-colors hover:text-teal-500",
                  filters.selectedRooms === rooms
                    ? "text-black font-bold scale-110"
                    : "text-slate-400"
                )}
              >
                {rooms}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="flex flex-col gap-2 min-w-[250px] flex-1">
          <span className="text-sm font-medium text-slate-700">Prix</span>
          <div className="pt-2 px-1">
            <Slider
              defaultValue={[filters.minPrice, filters.maxPrice]}
              min={priceRange[0]}
              max={priceRange[1]}
              step={1000}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={(values) => {
                onFiltersChange({
                  ...filters,
                  minPrice: values[0],
                  maxPrice: values[1],
                });
              }}
              className="[&>.relative>.absolute]:bg-teal-400 [&>.block]:border-teal-400 [&>.block]:bg-teal-400"
            />
          </div>
          <div className="flex justify-between mt-1 text-sm font-medium text-slate-600">
            <span>{formatPrice(filters.minPrice)} MAD</span>
            <span>{formatPrice(filters.maxPrice)} MAD</span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terrace" 
              checked={filters.hasTerrace}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, hasTerrace: checked === true })
              }
              className="data-[state=checked]:bg-teal-400 data-[state=checked]:border-teal-400"
            />
            <Label htmlFor="terrace" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Appartements avec terrasse
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="commercial" 
              checked={filters.isCommercial}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, isCommercial: checked === true })
              }
              className="data-[state=checked]:bg-teal-400 data-[state=checked]:border-teal-400"
            />
            <Label htmlFor="commercial" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              locaux commerciaux uniquement
            </Label>
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          variant="ghost" 
          onClick={onClear}
          className="flex items-center gap-2 hover:bg-slate-50 text-slate-600"
        >
          <RefreshCw className="w-4 h-4" />
          Filtre clair
        </Button>
      </div>
    </div>
  );
}
