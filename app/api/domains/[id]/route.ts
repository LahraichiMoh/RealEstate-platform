import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const clientId = (session.user as any)?.clientId;

    // Get the domain to verify it belongs to the client
    const domain = await prisma.domain.findUnique({
      where: { id },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Verify ownership
    if (domain.clientId !== clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.domain.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Domain DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const clientId = (session.user as any)?.clientId;
    const body = await request.json();

    // Get the domain to verify it belongs to the client
    const domain = await prisma.domain.findUnique({
      where: { id },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Verify ownership
    if (domain.clientId !== clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If setting as primary, unset other primary domains
    if (body.isPrimary) {
      await prisma.domain.updateMany({
        where: { clientId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updatedDomain = await prisma.domain.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error("[Domain PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update domain" },
      { status: 500 }
    );
  }
}
