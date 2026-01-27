import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationRequestSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reservations = await prisma.reservationRequest.findMany({
      include: {
        project: true,
        apartment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("[Reservations GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reservationRequestSchema.parse(body);

    const reservation = await prisma.reservationRequest.create({
      data: validatedData,
      include: {
        project: true,
        apartment: true,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("[Reservations POST]", error);
    return NextResponse.json(
      { error: "Failed to create reservation request" },
      { status: 500 }
    );
  }
}
