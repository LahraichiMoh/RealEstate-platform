import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const project = await prisma.project.findUnique({
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

    const project = await prisma.project.update({
      where: { slug },
      data: body,
    });

    return NextResponse.json(project);
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

    await prisma.project.delete({
      where: { slug },
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
