"use client";

import React, { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import ApartmentEditor from "./ApartmentEditor";

interface Apartment {
  id: string;
  number: string;
  rooms: number;
  area: number;
  price: number;
  status: string;
  planImage?: string | null;
  images?: string | null;
}

interface Floor {
  id: string;
  floorNumber: number;
  apartments: Apartment[];
}

interface ProjectApartmentManagerProps {
  floors: Floor[];
  onApartmentUpdate: () => void;
}

export default function ProjectApartmentManager({ floors, onApartmentUpdate }: ProjectApartmentManagerProps) {
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEdit = (apt: Apartment) => {
    setSelectedApartment(apt);
    setIsEditorOpen(true);
  };

  const handleSave = (updated: Apartment) => {
    onApartmentUpdate();
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {floors.map((floor) => (
          <AccordionItem key={floor.id} value={floor.id}>
            <AccordionTrigger className="hover:no-underline px-2 hover:bg-slate-50 rounded">
              <span className="flex items-center gap-2">
                Floor {floor.floorNumber} 
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({floor.apartments.length} Units)
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2 px-2">
                {floor.apartments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No apartments on this floor.</p>
                ) : (
                  floor.apartments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="font-medium min-w-[60px]">Unit {apt.number}</div>
                        <Badge variant={apt.status === "AVAILABLE" ? "outline" : apt.status === "SOLD" ? "destructive" : "secondary"} className={apt.status === "AVAILABLE" ? "bg-green-50 text-green-700 border-green-200" : ""}>
                          {apt.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {apt.rooms} rooms • {apt.area} m² • {apt.price.toLocaleString()} MAD
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(apt)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <ApartmentEditor 
        apartment={selectedApartment}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
