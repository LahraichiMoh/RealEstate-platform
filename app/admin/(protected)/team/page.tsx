'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function TeamPage() {
  const { data: session, status } = useSession()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const clientId = (session?.user as any)?.clientId
  const userRole = (session?.user as any)?.role

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      redirect('/admin/login')
    }

    if (!clientId || userRole === 'SUPER_ADMIN') {
      redirect('/admin/dashboard')
    }

    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/admin/users')
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error('Error fetching team:', error)
        toast.error('Failed to load team members')
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [session, status, clientId, userRole])

  if (loading) {
    return <div>Loading team members...</div>
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this team member?')) return

    try {
      const response = await fetch(`/api/admin/users/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove')

      setMembers(members.filter(m => m.id !== memberId))
      toast.success('Team member removed')
    } catch (error) {
      toast.error('Failed to remove team member')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-gray-600 mt-2">Manage your sales team</p>
        </div>
        <Link href={`/admin/clients/${clientId}/users/new`}>
          <Button>+ Add Team Member</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Team</CardTitle>
          <CardDescription>Total: {members.length} team members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No team members yet
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {member.role !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Pro Tip:</strong> Invite agents to help sell your properties. Agents can view your projects but cannot make changes.
        </p>
      </div>
    </div>
  )
}
