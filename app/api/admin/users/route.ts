import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClientUserSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const clientId = (session.user as any).clientId

    let query: any = {}
    
    if (userRole === 'SUPER_ADMIN') {
      // Super admin can see all users
    } else if (userRole === 'OWNER') {
      // Owners can only see their own team
      query.clientId = clientId
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: query,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        clientId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const sessionClientId = (session.user as any).clientId

    // Super admin or owner of the client
    const data = await request.json()
    
    if (userRole === 'SUPER_ADMIN') {
      // Super admin can create users for any client
    } else if (userRole === 'OWNER') {
      // Owner can only create users for their own client
      if (data.clientId !== sessionClientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const validated = createClientUserSchema.parse(data)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        role: validated.role,
        clientId: validated.clientId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        clientId: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
