import React from "react";
import { cn } from "@/lib/utils";

interface ApartmentListItemProps {
  apartment: {
    id: string;
    number: string;
    rooms: number;
    area: number;
    price: number;
    status: string;
    floorNumber?: number; // Passed from parent
  };
  onClick?: () => void;
  className?: string;
}

export default function ApartmentListItem({ apartment, onClick, className }: ApartmentListItemProps) {
  // Determine type label based on rooms or other props (mock logic for now as 'type' isn't in schema)
  // Screenshot shows "locaux commerciaux" for G2/G1 and "Appartement" for others.
  // We'll assume if rooms is 0 or very specific, it might be commercial, otherwise Apartment.
  // For now, hardcode "Appartement" unless we have data.
  const typeLabel = "Appartement"; 

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex flex-col md:flex-row items-start md:items-center py-6 px-4 md:px-8 transition-colors cursor-pointer gap-4 md:gap-0",
        className
      )}
    >
      {/* Unit Number & Type */}
      <div className="w-full md:w-[20%] flex flex-row md:flex-col items-baseline md:items-start gap-2 md:gap-0">
        <span className="text-3xl font-bold text-slate-800">{apartment.number}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium leading-tight max-w-[80px]">{typeLabel}</span>
      </div>

      {/* Floor */}
      <div className="w-1/2 md:w-[15%] flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-700">{apartment.floorNumber}</span>
        <span className="text-xs text-slate-400 font-medium">haut</span>
      </div>

      {/* Rooms */}
      <div className="w-1/2 md:w-[15%] flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-700">{apartment.rooms}</span>
        <span className="text-xs text-slate-400 font-medium">chambres</span>
      </div>

      {/* Area */}
      <div className="w-1/2 md:w-[15%] flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-700">{apartment.area}</span>
        <span className="text-xs text-slate-400 font-medium">m²</span>
      </div>

      {/* Price */}
      <div className="w-1/2 md:w-[20%] flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-800">
          {apartment.price.toLocaleString('fr-FR').replace(/,/g, " ")}
        </span>
        <span className="text-xs text-slate-400 font-medium mb-1">€</span>
      </div>

      {/* Status / Tag */}
      <div className="w-full md:w-[15%] flex justify-end">
        {apartment.status !== "AVAILABLE" && (
           <span className={cn(
             "text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wider",
             apartment.status === "RESERVED" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
           )}>
             {apartment.status}
           </span>
        )}
        {apartment.status === "AVAILABLE" && (
          <span className="hidden md:inline-block text-[10px] text-slate-400 font-medium max-w-[150px] text-right">
            Dernier appartement disponible avec terrasse
          </span>
        )}
      </div>
    </div>
  );
}
