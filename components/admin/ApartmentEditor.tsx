"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Upload, Trash } from "lucide-react";
import Image from "next/image";

interface Apartment {
  id: string;
  number: string;
  rooms: number;
  area: number;
  price: number;
  status: string;
  planImage?: string | null;
  plan3dImage?: string | null;
  images?: string | null; // JSON string
}

interface ApartmentEditorProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedApartment: Apartment) => void;
}

export default function ApartmentEditor({ apartment, isOpen, onClose, onSave }: ApartmentEditorProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    number: "",
    rooms: 1,
    area: 0,
    price: 0,
    status: "AVAILABLE",
    planImage: "",
    plan3dImage: "",
    images: [] as string[],
  });

  useEffect(() => {
    if (apartment) {
      let parsedImages: string[] = [];
      try {
        if (apartment.images) {
          parsedImages = JSON.parse(apartment.images);
        }
      } catch (e) {
        console.error("Failed to parse apartment images", e);
      }

      setFormData({
        number: apartment.number,
        rooms: apartment.rooms,
        area: apartment.area,
        price: apartment.price,
        status: apartment.status,
        planImage: apartment.planImage || "",
        plan3dImage: apartment.plan3dImage || "",
        images: parsedImages,
      });
    }
  }, [apartment]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "planImage" | "plan3dImage" | "images") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        
        if (field === "planImage") {
          setFormData(prev => ({ ...prev, planImage: data.url }));
        } else if (field === "plan3dImage") {
          setFormData(prev => ({ ...prev, plan3dImage: data.url }));
        } else {
          setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!apartment) return;
    
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        images: JSON.stringify(formData.images),
        // Ensure numbers are numbers
        rooms: parseInt(formData.rooms.toString()),
        area: parseFloat(formData.area.toString()),
        price: parseFloat(formData.price.toString()),
      };

      const response = await fetch(`/api/apartments/${apartment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update apartment");

      const updated = await response.json();
      onSave(updated);
      onClose();
      toast({ title: "Saved", description: "Apartment updated successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save apartment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Apartment {formData.number}</SheetTitle>
          <SheetDescription>
            Update details and media for this apartment.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Apartment Number</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rooms">Rooms</Label>
              <Input
                id="rooms"
                type="number"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area (m²)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (MAD)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>2D Plan Image</Label>
            <div className="flex items-center gap-4">
              {formData.planImage && (
                <div className="relative w-20 h-20 border rounded overflow-hidden">
                  <Image src={formData.planImage} alt="Plan" fill className="object-cover" />
                  <button
                    onClick={() => setFormData({ ...formData, planImage: "" })}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "planImage")}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>3D Plan Image</Label>
            <div className="flex items-center gap-4">
              {formData.plan3dImage && (
                <div className="relative w-20 h-20 border rounded overflow-hidden">
                  <Image src={formData.plan3dImage} alt="3D Plan" fill className="object-cover" />
                  <button
                    onClick={() => setFormData({ ...formData, plan3dImage: "" })}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "plan3dImage")}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square border rounded overflow-hidden">
                  <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, "images")}
              disabled={isUploading}
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
