import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { floorSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const projectId = slug;

    const floors = await prisma.floor.findMany({
      where: { projectId },
      include: {
        apartments: true,
      },
      orderBy: {
        floorNumber: "asc",
      },
    });

    return NextResponse.json(floors);
  } catch (error) {
    console.error("[Floors GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch floors" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const projectId = slug;
    const body = await request.json();
    const validatedData = floorSchema.parse(body);

    const floor = await prisma.floor.create({
      data: {
        ...validatedData,
        projectId,
      },
      include: {
        apartments: true,
      },
    });

    return NextResponse.json(floor, { status: 201 });
  } catch (error) {
    console.error("[Floors POST]", error);
    return NextResponse.json(
      { error: "Failed to create floor" },
      { status: 500 }
    );
  }
}
