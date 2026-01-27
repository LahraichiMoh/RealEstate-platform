import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apartmentSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ floorId: string }> }
) {
  try {
    const { floorId } = await params;

    const apartments = await prisma.apartment.findMany({
      where: { floorId },
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("[Apartments GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch apartments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ floorId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { floorId } = await params;
    const body = await request.json();
    const validatedData = apartmentSchema.parse(body);

    // Get the floor to get projectId
    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
    });

    if (!floor) {
      return NextResponse.json(
        { error: "Floor not found" },
        { status: 404 }
      );
    }

    const apartment = await prisma.apartment.create({
      data: {
        ...validatedData,
        floorId,
        projectId: floor.projectId,
      },
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error("[Apartments POST]", error);
    return NextResponse.json(
      { error: "Failed to create apartment" },
      { status: 500 }
    );
  }
}
