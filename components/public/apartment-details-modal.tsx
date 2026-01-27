"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bed, Square, DollarSign, X } from "lucide-react";
import ReservationForm from "./reservation-form";

interface Apartment {
  id: string;
  number: string;
  rooms: number;
  area: number;
  price: number;
  status: string;
  floorId: string;
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
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apartment {apartment.number}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reserve">Reserve</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bed className="w-4 h-4" />
                  Rooms
                </div>
                <p className="text-2xl font-bold">{apartment.rooms}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Square className="w-4 h-4" />
                  Area
                </div>
                <p className="text-2xl font-bold">{apartment.area} m²</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  Price
                </div>
                <p className="text-2xl font-bold">${apartment.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Status</h3>
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

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Details</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Apartment Number:</span>
                  <span className="font-medium">{apartment.number}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Price per m²:</span>
                  <span className="font-medium">
                    ${Math.round(apartment.price / apartment.area).toLocaleString()}
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="reserve" className="mt-6">
            <ReservationForm apartment={apartment} projectId={projectId} onSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
