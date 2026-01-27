"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ApartmentFiltersProps {
  filters: {
    status: string;
    minRooms: number;
    maxRooms: number;
    minPrice: number;
    maxPrice: number;
    minArea: number;
    maxArea: number;
  };
  onFiltersChange: (filters: any) => void;
}

export default function ApartmentFilters({ filters, onFiltersChange }: ApartmentFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Apartments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={(val) => handleFilterChange("status", val)}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rooms Filter */}
        <div className="space-y-3">
          <Label>Rooms: {filters.minRooms} - {filters.maxRooms}</Label>
          <Slider
            min={0}
            max={10}
            step={1}
            value={[filters.minRooms, filters.maxRooms]}
            onValueChange={(values) => {
              handleFilterChange("minRooms", values[0]);
              handleFilterChange("maxRooms", values[1]);
            }}
            className="w-full"
          />
        </div>

        {/* Price Filter */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", parseInt(e.target.value) || 10000000)}
              />
            </div>
          </div>
        </div>

        {/* Area Filter */}
        <div className="space-y-3">
          <Label>Area (m²): {filters.minArea} - {filters.maxArea}</Label>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={[filters.minArea, filters.maxArea]}
            onValueChange={(values) => {
              handleFilterChange("minArea", values[0]);
              handleFilterChange("maxArea", values[1]);
            }}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
