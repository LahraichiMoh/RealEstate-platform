import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    console.log("[Apartment PATCH] Updating apartment:", id, "with body:", JSON.stringify(body, null, 2));

    const apartment = await prisma.apartment.update({
      where: { id },
      data: body,
    });

    console.log("[Apartment PATCH] Success:", apartment);
    return NextResponse.json(apartment);
  } catch (error) {
    console.error("[Apartment PATCH] Error:", error);
    if (error instanceof Error) {
        console.error("[Apartment PATCH] Stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to update apartment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.apartment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Apartment DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete apartment" },
      { status: 500 }
    );
  }
}
