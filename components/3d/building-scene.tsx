// @ts-nocheck
"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree, ThreeEvent, ThreeElements } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface Floor {
  id: string;
  floorNumber: number;
  label: string | null;
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

interface BuildingSceneProps {
  floors: Floor[];
  selectedFloorId?: string;
  onFloorClick: (floorId: string) => void;
  onApartmentClick: (apartmentId: string) => void;
}

function FloorMesh({
  floor,
  isSelected,
  onFloorClick,
  onApartmentClick,
}: {
  floor: Floor;
  isSelected: boolean;
  onFloorClick: (floorId: string) => void;
  onApartmentClick: (apartmentId: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  const yPosition = floor.floorNumber * 3;

  return (
    <group
      ref={meshRef}
      position={[0, yPosition, 0]}
      onClick={() => onFloorClick(floor.id)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* Floor platform */}
      <mesh
        position={[0, 0, 0]}
        scale={isSelected || isHovered ? 1.05 : 1}
      >
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial
          color={isSelected ? "#3b82f6" : isHovered ? "#60a5fa" : "#e5e7eb"}
          metalness={0.3}
          roughness={0.4}
          emissive={isSelected ? "#1e40af" : "#0"}
        />
      </mesh>

      {/* Apartment units on the floor */}
      {floor.apartments.map((apartment, index) => {
        const x = -8 + (index % 3) * 8;
        const z = -8 + Math.floor(index / 3) * 8;

        let color = "#10b981"; // Available - green
        if (apartment.status === "RESERVED") color = "#f59e0b"; // Reserved - amber
        if (apartment.status === "SOLD") color = "#ef4444"; // Sold - red

        return (
          <group
            key={apartment.id}
            position={[x, 0.5, z]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onApartmentClick(apartment.id);
            }}
          >
            {/* Apartment box */}
            <mesh>
              <boxGeometry args={[2.5, 0.8, 2.5]} />
              <meshStandardMaterial color={color} metalness={0.4} />
            </mesh>

            {/* Apartment label */}
            <mesh position={[0, 0.6, 0]}>
              <planeGeometry args={[2, 0.4]} />
              <meshStandardMaterial color="#fff" emissive="#000" />
            </mesh>
          </group>
        );
      })}

      {/* Floor label */}
      <mesh position={[0, 1.2, -11]} scale={0.5}>
        <planeGeometry args={[4, 1]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>
    </group>
  );
}

function BuildingContent({
  floors,
  selectedFloorId,
  onFloorClick,
  onApartmentClick,
}: Omit<BuildingSceneProps, "children">) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Auto-focus on selected floor
  useFrame(() => {
    if (selectedFloorId && controlsRef.current) {
      const selectedFloor = floors.find((f) => f.id === selectedFloorId);
      if (selectedFloor) {
        const targetY = selectedFloor.floorNumber * 3;
        camera.position.lerp(
          new THREE.Vector3(0, targetY + 8, 25),
          0.05
        );
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 15, 30]} />
      <OrbitControls ref={controlsRef} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Building structure */}
      <group>
        {floors.map((floor) => (
          <FloorMesh
            key={floor.id}
            floor={floor}
            isSelected={floor.id === selectedFloorId}
            onFloorClick={onFloorClick}
            onApartmentClick={onApartmentClick}
          />
        ))}
      </group>

      {/* Grid background */}
      <gridHelper args={[50, 50]} position={[0, -0.5, 0]} />
    </>
  );
}

export function BuildingScene({
  floors,
  selectedFloorId,
  onFloorClick,
  onApartmentClick,
}: BuildingSceneProps) {
  return (
    <Canvas className="!bg-gradient-to-b from-sky-100 to-slate-50">
      <BuildingContent
        floors={floors}
        selectedFloorId={selectedFloorId}
        onFloorClick={onFloorClick}
        onApartmentClick={onApartmentClick}
      />
    </Canvas>
  );
}

export function Building2DFallback({
  floors,
  selectedFloorId,
  onFloorClick,
  onApartmentClick,
}: BuildingSceneProps) {
  return (
    <div className="bg-slate-100 rounded-lg p-6 space-y-4">
      <div className="text-sm font-medium text-muted-foreground">
        3D View Unavailable - Showing 2D Fallback
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => onFloorClick(floor.id)}
            className={`w-full p-3 text-left rounded-lg border transition-colors ${
              selectedFloorId === floor.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">{floor.label || `Floor ${floor.floorNumber}`}</div>
            <div className="text-sm text-muted-foreground">
              {floor.apartments.length} apartments
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
