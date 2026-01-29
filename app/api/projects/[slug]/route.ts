import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let project = await prisma.project.findFirst({
      where: { slug },
      include: {
        floors: {
          include: {
            apartments: true,
          },
          orderBy: {
            floorNumber: "asc",
          },
        },
      },
    });

    if (!project) {
      project = await prisma.project.findUnique({
        where: { id: slug },
        include: {
          floors: {
            include: {
              apartments: true,
            },
            orderBy: {
              floorNumber: "asc",
            },
          },
        },
      });
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[Project GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Check if project exists by slug or id
    let project = await prisma.project.findFirst({ where: { slug } });
    if (!project) {
      project = await prisma.project.findUnique({ where: { id: slug } });
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const { floorsConfig, ...updateData } = body;

    const updatedProject = await prisma.$transaction(async (tx) => {
      // Update basic project info
      const updated = await tx.project.update({
        where: { id: project.id },
        data: updateData,
      });

      // Handle floors config update
      if (floorsConfig && Array.isArray(floorsConfig)) {
        for (const config of floorsConfig) {
          // Find existing floor
          const existingFloor = await tx.floor.findFirst({
            where: {
              projectId: project.id,
              floorNumber: config.floorNumber,
            },
            include: {
              _count: {
                select: { apartments: true }
              }
            }
          });

          let floorId = "";
          let currentApartmentsCount = 0;

          if (existingFloor) {
            floorId = existingFloor.id;
            currentApartmentsCount = existingFloor._count.apartments;

            if (config.coordinates !== undefined) {
              await tx.floor.update({
                where: { id: existingFloor.id },
                data: { coordinates: config.coordinates } as any
              });
            }
          } else {
            const newFloor = await tx.floor.create({
              data: {
                projectId: project.id,
                floorNumber: config.floorNumber,
                label: `Floor ${config.floorNumber}`,
                coordinates: config.coordinates,
              } as any,
            });
            floorId = newFloor.id;
            currentApartmentsCount = 0;
          }

          const targetApartmentsCount = config.apartmentsCount;

          if (targetApartmentsCount > currentApartmentsCount) {
            // Add missing apartments
            const apartmentsToAdd = targetApartmentsCount - currentApartmentsCount;
            const newApartmentsData = Array.from({ length: apartmentsToAdd }).map((_, idx) => ({
              projectId: project.id,
              floorId: floorId,
              number: `${config.floorNumber}${String(currentApartmentsCount + idx + 1).padStart(2, '0')}`,
              rooms: 1,
              area: 50,
              price: 0,
              status: "AVAILABLE",
            }));

            await tx.apartment.createMany({
              data: newApartmentsData,
            });
          }
        }
      }

      return updated;
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[Project PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if project exists by slug or id
    let project = await prisma.project.findFirst({ where: { slug } });
    if (!project) {
      project = await prisma.project.findUnique({ where: { id: slug } });
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id: project.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Project DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
