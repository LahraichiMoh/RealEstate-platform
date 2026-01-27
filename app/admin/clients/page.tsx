'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
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
import { Edit, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  status: string
  createdAt: string
  _count?: {
    projects: number
    users: number
  }
}

export default function ClientsPage() {
  const { data: session } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = (session?.user as any)?.role

  useEffect(() => {
    if (userRole !== 'SUPER_ADMIN') return

    const fetchClients = async () => {
      try {
        const response = await fetch('/api/admin/clients')
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error('Error fetching clients:', error)
        toast.error('Failed to load clients')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [userRole])

  if (userRole !== 'SUPER_ADMIN') {
    return <div className="text-center py-12">Access denied. Super admin only.</div>
  }

  if (loading) {
    return <div>Loading clients...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-600 mt-2">Manage all real estate clients</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>+ New Client</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>Total: {clients.length} clients</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.city || '-'}</TableCell>
                  <TableCell>{client._count?.projects || 0}</TableCell>
                  <TableCell>{client._count?.users || 0}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Link href={`/admin/clients/${client.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/clients/${client.id}/users`}>
                      <Button variant="ghost" size="sm">
                        <Users className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
