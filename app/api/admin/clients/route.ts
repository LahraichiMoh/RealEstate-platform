import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            projects: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(clients)
  } catch (error: any) {
    console.error('Error fetching clients:', error)
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
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    const validated = clientSchema.parse(data)

    // Generate a random access code
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    const client = await prisma.client.create({
      data: {
        ...validated,
        accessCode,
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
