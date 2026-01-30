"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Point {
  x: number;
  y: number;
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
  status: string;
  rooms: number;
  area: number;
  price: number;
}

interface BuildingImageInteractiveProps {
  image: string;
  floors: Floor[];
  selectedFloorId: string | null;
  onFloorSelect: (floorId: string) => void;
  className?: string;
  salesPercentage?: number;
  builtPercentage?: number;
}

export default function BuildingImageInteractive({
  image,
  floors,
  selectedFloorId,
  onFloorSelect,
  className,
  salesPercentage = 0,
  builtPercentage = 0,
}: BuildingImageInteractiveProps) {
  const [hoveredFloorId, setHoveredFloorId] = useState<string | null>(null);
  const [scanFloorId, setScanFloorId] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{x: number, y: number} | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x, y });
  };

  useEffect(() => {
    // Scanner animation: Up then Down
    if (floors.length === 0) return;

    const sorted = [...floors].sort((a, b) => a.floorNumber - b.floorNumber);
    const ids = sorted.map(f => f.id);
    
    // Sequence: 0 -> 1 -> ... -> Top -> ... -> 1 -> 0 -> null
    const upSequence = [...ids];
    const downSequence = [...ids].reverse().slice(1); // avoid repeating top
    const sequence = [...upSequence, ...downSequence, null];

    let step = 0;
    const interval = setInterval(() => {
        if (step >= sequence.length) {
            clearInterval(interval);
            setScanFloorId(null);
            return;
        }
        setScanFloorId(sequence[step] || null);
        step++;
    }, 200); // 200ms per floor

    return () => clearInterval(interval);
  }, [floors]); // Only run when floors change (initially)

  useEffect(() => {
    // Debug: Check if floors have coordinates
    const floorsWithCoords = floors.filter(f => f.coordinates);
    console.log(`[BuildingImageInteractive] Floors: ${floors.length}, With Coords: ${floorsWithCoords.length}`);
    if (floorsWithCoords.length === 0 && floors.length > 0) {
        console.warn("[BuildingImageInteractive] No floors have coordinates!");
    }
  }, [floors]);

  const getPoints = (coordinates: string | null | undefined) => {
    if (!coordinates) return null;
    try {
      const points = JSON.parse(coordinates) as Point[];
      return points.map((p) => `${p.x},${p.y}`).join(" ");
    } catch (e) {
      return null;
    }
  };

  const activeFloorId = hoveredFloorId || selectedFloorId;

  const hoveredFloor = floors.find(f => f.id === hoveredFloorId);
  
  const minFloor = floors.length > 0 ? Math.min(...floors.map(f => f.floorNumber)) : 0;
  const maxFloor = floors.length > 0 ? Math.max(...floors.map(f => f.floorNumber)) : 0;
  
  // Calculate details for hover card
  const availableApartments = hoveredFloor ? hoveredFloor.apartments.filter(a => a.status === "AVAILABLE") : [];
  const minArea = availableApartments.length > 0 ? Math.min(...availableApartments.map(a => a.area)) : 0;
  const maxArea = availableApartments.length > 0 ? Math.max(...availableApartments.map(a => a.area)) : 0;
  const areaDisplay = availableApartments.length > 0 
    ? minArea === maxArea ? `${minArea} m²` : `${minArea} m² - ${maxArea} m²`
    : "N/A";
  
  // Determine card position (Left or Right of the point)
  const isRightSide = cursorPos && cursorPos.x > 50;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-auto bg-slate-100 overflow-hidden group ${className !== undefined ? className : "rounded-lg border shadow-sm"}`}
    >
      <img
        src={image}
        alt="Building Visualization"
        className="w-full h-auto block pointer-events-none"
      />
      
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {floors.map((floor) => {
          const points = getPoints(floor.coordinates);
          if (!points) return null;
          
          const isSelected = selectedFloorId === floor.id;
          const isHovered = hoveredFloorId === floor.id;
          const isHighlighted = scanFloorId === floor.id;
          
          return (
            <g key={floor.id} className="pointer-events-auto cursor-pointer"
               onClick={() => onFloorSelect(floor.id)}
               onMouseEnter={() => setHoveredFloorId(floor.id)}
               onMouseLeave={() => setHoveredFloorId(null)}
            >
              <polygon
                points={points}
                fill={isSelected ? "rgba(59, 130, 246, 0.4)" : isHovered ? "rgba(45, 212, 191, 0.5)" : isHighlighted ? "rgba(45, 212, 191, 0.3)" : "rgba(255, 255, 255, 0.01)"}
                stroke={isSelected ? "#2563eb" : isHovered ? "#14b8a6" : isHighlighted ? "#14b8a6" : "transparent"}
                strokeWidth={isSelected ? 1 : 0.5}
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-300 ease-in-out"
              />
            </g>
          );
        })}
      </svg>

      {hoveredFloor && cursorPos && (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-75 ease-out fade-in zoom-in-95"
          style={{
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
            transform: isRightSide ? 'translate(-100%, -50%)' : 'translate(0, -50%)'
          }}
        >
          <div className={`relative flex items-center ${isRightSide ? 'pr-6' : 'pl-6'}`}>
              
              {/* Connector Dot/Arrow */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-[#14b8a6] rounded-full flex items-center justify-center border-4 border-white shadow-lg z-30 ${isRightSide ? 'right-0' : 'left-0'}`}
              >
                  {isRightSide ? <ChevronLeft className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
              </div>

              {/* Card Content */}
              <div className="bg-[#2e2b44]/95 backdrop-blur-sm text-white p-5 rounded-3xl shadow-2xl min-w-[260px] relative overflow-hidden border border-white/10">
                  {/* Large Faded Number Background */}
                  <div className="absolute -top-6 -right-4 text-[8rem] font-bold text-white/5 select-none leading-none">
                      {hoveredFloor.floorNumber.toString().padStart(2, '0')}
                  </div>
                  
                  <div className="relative z-10 flex justify-between items-start gap-4">
                      <div className="space-y-3">
                          <div>
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Available apartments</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-bold text-white">
                                    {availableApartments.length}
                                </span>
                              </div>
                          </div>
                          
                          {availableApartments.length > 0 && (
                              <div>
                                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Area</p>
                                  <p className="text-lg font-medium text-gray-200 mt-0.5">{areaDisplay}</p>
                              </div>
                          )}
                      </div>
                      
                      <div className="text-5xl font-bold text-white/20 leading-none">
                          {hoveredFloor.floorNumber.toString().padStart(2, '0')}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      )}

      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)',
            pointerEvents: 'none'
        }}
      />

      {/* Statistics Overlay */}
      <div className="absolute bottom-0 right-0 flex rounded-tl-[3rem] overflow-hidden shadow-xl z-20">
        <div className="bg-[#b8b8d1] px-8 py-6 flex flex-col items-center justify-center min-w-[140px]">
          <span className="text-slate-700 text-sm font-medium mb-1">Vendu:</span>
          <span className="text-slate-800 text-4xl font-bold">{salesPercentage}%</span>
        </div>
        <div className="bg-[#474761] px-8 py-6 flex flex-col items-center justify-center min-w-[140px]">
          <span className="text-white text-sm font-medium mb-1">Construit:</span>
          <span className="text-white text-4xl font-bold">{builtPercentage}%</span>
        </div>
      </div>
    </div>
  );
}
