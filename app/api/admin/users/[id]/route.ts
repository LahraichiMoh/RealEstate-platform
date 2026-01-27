import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const sessionClientId = (session.user as any).clientId
    const userId = params.id

    // Get the user to delete
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { clientId: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Authorization checks
    if (userRole === 'SUPER_ADMIN') {
      // Super admin can delete any user
    } else if (userRole === 'OWNER') {
      // Owner can only delete team members from their own client
      if (targetUser.clientId !== sessionClientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Owners cannot delete other owners
      if (targetUser.role === 'OWNER') {
        return NextResponse.json({ error: 'Cannot delete owner' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'User deleted' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
