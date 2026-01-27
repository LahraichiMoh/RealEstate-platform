import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { domainSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = (session.user as any)?.clientId;
    const userRole = (session.user as any)?.role;

    if (!clientId && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Super admin gets all domains, clients get their own
    const domains = userRole === "SUPER_ADMIN"
      ? await prisma.domain.findMany({
          include: { client: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.domain.findMany({
          where: { clientId },
          orderBy: { createdAt: "desc" },
        });

    return NextResponse.json(domains);
  } catch (error) {
    console.error("[Domains GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = (session.user as any)?.clientId;
    const userRole = (session.user as any)?.role;

    // Only OWNER/AGENT can add domains to their own client
    if (!clientId || (userRole !== "OWNER" && userRole !== "AGENT")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = domainSchema.parse(body);

    // Check if domain already exists
    const existingDomain = await prisma.domain.findUnique({
      where: { domain: validatedData.domain },
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: "Domain already registered" },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary domains
    if (validatedData.isPrimary) {
      await prisma.domain.updateMany({
        where: { clientId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const domain = await prisma.domain.create({
      data: {
        ...validatedData,
        clientId,
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error("[Domains POST]", error);
    return NextResponse.json(
      { error: "Failed to create domain" },
      { status: 500 }
    );
  }
}
