import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        location: true,
        coverImage: true,
        floorsCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[Projects GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clientId = (session.user as any)?.clientId;
    const userRole = (session.user as any)?.role;

    // Only clients (OWNER/AGENT) can create projects in their own account
    if (!clientId || (userRole !== 'OWNER' && userRole !== 'AGENT')) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Check if slug is unique within this client
    const existingProject = await prisma.project.findFirst({
      where: {
        clientId,
        slug: validatedData.slug,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project slug already exists" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        clientId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[Projects POST]", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
