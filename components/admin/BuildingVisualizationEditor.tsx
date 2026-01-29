"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Wand2, Save, Plus, X, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Point {
  x: number;
  y: number;
}

interface FloorConfig {
  floorNumber: number;
  coordinates?: string; // JSON string of Point[]
}

interface BuildingVisualizationEditorProps {
  projectId: string;
  initialImage?: string | null;
  floors: FloorConfig[];
  onSave: (image: string, floors: FloorConfig[]) => Promise<void>;
}

interface Spine {
  id: string;
  top: Point;
  bottom: Point;
}

export default function BuildingVisualizationEditor({
  projectId,
  initialImage,
  floors,
  onSave,
}: BuildingVisualizationEditorProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Store points as percentages (0-100)
  const [floorPolygons, setFloorPolygons] = useState<Record<number, Point[]>>({});
  const [selectedPoint, setSelectedPoint] = useState<{ floor: number; index: number } | null>(null);
  
  // Wizard Mode State (Vertical Spines)
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [spines, setSpines] = useState<Spine[]>([
    { id: '1', top: { x: 20, y: 10 }, bottom: { x: 20, y: 90 } }, // Left
    { id: '2', top: { x: 50, y: 15 }, bottom: { x: 50, y: 85 } }, // Center/Corner
    { id: '3', top: { x: 80, y: 10 }, bottom: { x: 80, y: 90 } }, // Right
  ]);
  const [selectedSpinePoint, setSelectedSpinePoint] = useState<{ id: string, type: 'top' | 'bottom' } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize polygons from props
    const initial: Record<number, Point[]> = {};
    let hasCoords = false;
    
    floors.forEach((f) => {
      if (f.coordinates) {
        try {
          initial[f.floorNumber] = JSON.parse(f.coordinates);
          hasCoords = true;
        } catch (e) {
          console.error("Failed to parse coordinates", e);
        }
      }
    });
    setFloorPolygons(initial);

    // If we have an image but NO coordinates, auto-trigger wizard mode
    // but only if we haven't already done it (we can check if floorPolygons is empty)
    if (initialImage && !hasCoords && floors.length > 0) {
        // We can't call applyWizardGeneration directly here because it depends on state
        // that might not be ready, but we can enter Wizard Mode automatically
        setIsWizardMode(true);
        
        // Optionally, we could try to auto-generate a default set immediately
        // so the user sees something.
        // Let's create a default set based on the default spines.
        // We need to duplicate the logic from applyWizardGeneration or extract it.
        // For now, let's just trigger the toast and mode.
        toast({ 
            title: "Auto-Setup", 
            description: "No floor zones detected. Entering setup mode. Please align the guides and click 'Generate Floors'." 
        });
    }
  }, [floors, initialImage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      setImage(data.url);
      
      // Reset spines
      setSpines([
        { id: '1', top: { x: 20, y: 10 }, bottom: { x: 20, y: 90 } },
        { id: '2', top: { x: 50, y: 15 }, bottom: { x: 50, y: 85 } },
        { id: '3', top: { x: 80, y: 10 }, bottom: { x: 80, y: 90 } },
      ]);
      
      toast({ title: "Image uploaded", description: "Use the wizard to define floor zones." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const startWizardMode = () => {
    if (!floors.length) return;
    setIsWizardMode(true);
    toast({ title: "Vertical Guides", description: "Align the vertical guides with your building's corners and edges." });
  };

  const addSpine = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    // Add slightly offset from last one
    const last = spines[spines.length - 1];
    const newSpine = {
      id: newId,
      top: { x: Math.min(last.top.x + 10, 95), y: last.top.y },
      bottom: { x: Math.min(last.bottom.x + 10, 95), y: last.bottom.y }
    };
    setSpines([...spines, newSpine]);
  };

  const removeSpine = (id: string) => {
    if (spines.length <= 2) {
      toast({ title: "Cannot remove", description: "Minimum 2 guides required", variant: "destructive" });
      return;
    }
    setSpines(spines.filter(s => s.id !== id));
  };

  const applyWizardGeneration = () => {
    if (!floors.length) return;

    const count = floors.length;
    const newPolygons: Record<number, Point[]> = {};

    // Sort floors by number (ascending) - Floor 1 is bottom
    const sortedFloors = [...floors].sort((a, b) => a.floorNumber - b.floorNumber);

    // Sort spines by X coordinate (average of top/bottom x)
    const sortedSpines = [...spines].sort((a, b) => {
      const avgA = (a.top.x + a.bottom.x) / 2;
      const avgB = (b.top.x + b.bottom.x) / 2;
      return avgA - avgB;
    });

    sortedFloors.forEach((f, index) => {
      // index 0 is Floor 1 (Bottom)
      const bottomFraction = index / count;
      const topFraction = (index + 1) / count;

      // Point calculation function
      const interpolate = (start: Point, end: Point, fraction: number) => ({
        x: start.x + (end.x - start.x) * fraction,
        y: start.y + (end.y - start.y) * fraction,
      });

      // Construct polygon points
      // Go forward along top edge of floor (Spine 0 -> N)
      const topPoints = sortedSpines.map(spine => 
        interpolate(spine.bottom, spine.top, topFraction)
      );

      // Go backward along bottom edge of floor (Spine N -> 0)
      const bottomPoints = [...sortedSpines].reverse().map(spine => 
        interpolate(spine.bottom, spine.top, bottomFraction)
      );

      newPolygons[f.floorNumber] = [...topPoints, ...bottomPoints];
    });

    setFloorPolygons(newPolygons);
    setIsWizardMode(false);
    toast({ title: "Zones Generated", description: "Floors aligned to vertical guides." });
  };

  const handleMouseDown = (id: string | number, typeOrIndex: string | number | null, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling
    
    if (isWizardMode) {
      // id is spine ID, typeOrIndex is 'top' | 'bottom'
      if (typeof id === 'string' && typeof typeOrIndex === 'string') {
        setSelectedSpinePoint({ id, type: typeOrIndex as 'top' | 'bottom' });
      }
    } else {
      // Standard mode: id is floor number, typeOrIndex is vertex index
      if (typeof id === 'number' && typeof typeOrIndex === 'number') {
        setSelectedPoint({ floor: id, index: typeOrIndex });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (isWizardMode && selectedSpinePoint) {
      setSpines(prev => prev.map(s => {
        if (s.id !== selectedSpinePoint.id) return s;
        return {
          ...s,
          [selectedSpinePoint.type]: { x: clampedX, y: clampedY }
        };
      }));
    } else if (selectedPoint) {
      setFloorPolygons((prev) => {
        const points = [...(prev[selectedPoint.floor] || [])];
        points[selectedPoint.index] = { x: clampedX, y: clampedY };
        return { ...prev, [selectedPoint.floor]: points };
      });
    }
  };

  const handleMouseUp = () => {
    setSelectedPoint(null);
    setSelectedSpinePoint(null);
  };

  const handleSave = async () => {
    if (!image) return;
    setIsSaving(true);
    try {
      const updatedFloors = floors.map(f => ({
        ...f,
        coordinates: floorPolygons[f.floorNumber] ? JSON.stringify(floorPolygons[f.floorNumber]) : undefined
      }));
      await onSave(image, updatedFloors);
      toast({ title: "Saved", description: "Building visualization updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                />
                <Button variant="outline" disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Image
                </Button>
            </div>
            
            {isWizardMode ? (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={addSpine} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Guide
                    </Button>
                    <Button variant="default" onClick={applyWizardGeneration} className="bg-green-600 hover:bg-green-700">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Floors
                    </Button>
                    <Button variant="ghost" onClick={() => setIsWizardMode(false)}>
                        Cancel
                    </Button>
                </div>
            ) : (
                <Button variant="secondary" onClick={startWizardMode} disabled={!image}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Auto-Detect Wizard
                </Button>
            )}
        </div>
        <Button onClick={handleSave} disabled={isSaving || !image || isWizardMode}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
        {isWizardMode 
            ? "Place vertical guides at the building's corners and edges. The system will interpolate floors between them." 
            : "Upload an image, then use the 'Auto-Detect Wizard' to generate floor zones for complex 3D shapes."}
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full border rounded-lg overflow-hidden bg-slate-100 select-none ${isWizardMode ? 'cursor-crosshair' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {image ? (
            <>
                <img 
                    src={image} 
                    alt="Building" 
                    className="w-full h-auto block pointer-events-none" 
                />
                
                {/* Standard Floor Polygons Layer (Visible in both modes, but dimmed in Wizard Mode) */}
                <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    style={{ opacity: isWizardMode ? 0.3 : 1 }}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    {Object.entries(floorPolygons).map(([floorNum, points]) => (
                        <g key={floorNum}>
                            <polygon
                                points={points.map(p => `${p.x},${p.y}`).join(" ")}
                                fill="rgba(59, 130, 246, 0.2)"
                                stroke="rgba(59, 130, 246, 0.8)"
                                strokeWidth="0.5"
                                vectorEffect="non-scaling-stroke"
                            />
                        </g>
                    ))}
                </svg>

                {/* Wizard Guide Layer (Only in Wizard Mode) */}
                {isWizardMode && (
                    <>
                        <svg 
                            className="absolute inset-0 w-full h-full pointer-events-none z-20"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            {/* Draw lines for each spine */}
                            {spines.map(spine => (
                                <line 
                                    key={`line-${spine.id}`}
                                    x1={spine.top.x} 
                                    y1={spine.top.y} 
                                    x2={spine.bottom.x} 
                                    y2={spine.bottom.y} 
                                    stroke="#16a34a" 
                                    strokeWidth="0.5" 
                                    strokeDasharray="1,1"
                                    vectorEffect="non-scaling-stroke"
                                />
                            ))}
                            
                            {/* Connect tops and bottoms to visualize the "Loft" surface */}
                            {spines.length > 1 && (() => {
                                // Sort spines for visualization
                                const sorted = [...spines].sort((a, b) => (a.top.x + a.bottom.x) - (b.top.x + b.bottom.x));
                                return (
                                    <>
                                        <polyline 
                                            points={sorted.map(s => `${s.top.x},${s.top.y}`).join(" ")}
                                            fill="none"
                                            stroke="#16a34a"
                                            strokeWidth="0.5"
                                            strokeOpacity="0.5"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                        <polyline 
                                            points={sorted.map(s => `${s.bottom.x},${s.bottom.y}`).join(" ")}
                                            fill="none"
                                            stroke="#16a34a"
                                            strokeWidth="0.5"
                                            strokeOpacity="0.5"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </>
                                );
                            })()}
                        </svg>
                        
                        {/* Interactive Handles for Spines */}
                        {spines.map((spine) => (
                            <React.Fragment key={spine.id}>
                                {/* Top Handle */}
                                <div
                                    className="absolute w-4 h-4 bg-green-600 border-2 border-white rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-lg z-30"
                                    style={{ left: `${spine.top.x}%`, top: `${spine.top.y}%` }}
                                    onMouseDown={(e) => handleMouseDown(spine.id, 'top', e)}
                                />
                                {/* Bottom Handle */}
                                <div
                                    className="absolute w-4 h-4 bg-green-600 border-2 border-white rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-lg z-30"
                                    style={{ left: `${spine.bottom.x}%`, top: `${spine.bottom.y}%` }}
                                    onMouseDown={(e) => handleMouseDown(spine.id, 'bottom', e)}
                                />
                                {/* Remove Button (Middle) */}
                                {spines.length > 2 && (
                                    <div 
                                        className="absolute w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:bg-red-600 z-40"
                                        style={{ 
                                            left: `${(spine.top.x + spine.bottom.x)/2}%`, 
                                            top: `${(spine.top.y + spine.bottom.y)/2}%` 
                                        }}
                                        onClick={(e) => { e.stopPropagation(); removeSpine(spine.id); }}
                                    >
                                        <X className="w-3 h-3" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </>
                )}

                {/* Standard Interactive Handles (Hidden in Wizard Mode) */}
                {!isWizardMode && Object.entries(floorPolygons).map(([floorNum, points]) => (
                    <div key={floorNum}>
                        {points.map((p, idx) => (
                            <div
                                key={idx}
                                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-md z-10"
                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                onMouseDown={(e) => handleMouseDown(Number(floorNum), idx, e)}
                            />
                        ))}
                        {/* Floor Label */}
                        <div 
                             className="absolute bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                             style={{ 
                                 left: `${points.reduce((acc, p) => acc + p.x, 0) / points.length}%`, 
                                 top: `${points.reduce((acc, p) => acc + p.y, 0) / points.length}%` 
                             }}
                        >
                            {floorNum}
                        </div>
                    </div>
                ))}
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Upload className="h-12 w-12 mb-2 opacity-20" />
                <p>Upload a building image to start</p>
            </div>
        )}
      </div>
    </div>
  );
}
