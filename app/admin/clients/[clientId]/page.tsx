'use client'

import React from "react"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
import { Building2, Users, Edit, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ClientDetail {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  status: string
  accessCode: string
  createdAt: string
}

interface Project {
  id: string
  name: string
  slug: string
  floorsCount: number
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const clientId = params.clientId as string

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = (session?.user as any)?.role
  const sessionClientId = (session?.user as any)?.clientId

  useEffect(() => {
    if (userRole !== 'SUPER_ADMIN' && sessionClientId !== clientId) {
      router.push('/admin/dashboard')
      return
    }

    const fetchData = async () => {
      try {
        const [clientRes, projectsRes, usersRes] = await Promise.all([
          fetch(`/api/admin/clients?id=${clientId}`),
          fetch(`/api/projects?clientId=${clientId}`),
          fetch(`/api/admin/users?clientId=${clientId}`),
        ])

        if (clientRes.ok) {
          const clientData = await clientRes.json()
          setClient(clientData[0] || null)
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData)
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Error fetching client data:', error)
        toast.error('Failed to load client details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clientId, userRole, sessionClientId, router])

  if (loading) {
    return <div>Loading client details...</div>
  }

  if (!client) {
    return <div className="text-center py-12">Client not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-gray-600 mt-2">{client.email}</p>
        </div>
        {userRole === 'SUPER_ADMIN' && (
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Code</CardTitle>
          <CardDescription>Share this code with the client to activate their account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded font-mono text-sm">{client.accessCode}</code>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(client.accessCode)
                toast.success('Access code copied!')
              }}
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Projects" value={projects.length} icon={<Building2 className="w-5 h-5" />} />
        <StatCard title="Team Members" value={users.length} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Status" value={client.status} icon={<Badge className="text-xs">{client.status}</Badge>} />
        <StatCard title="City" value={client.city || 'N/A'} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Projects</CardTitle>
            <CardDescription>All projects for this client</CardDescription>
          </div>
          {userRole === 'SUPER_ADMIN' && (
            <Link href={`/admin/projects/new?clientId=${clientId}`}>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Floors</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No projects yet
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.slug}</TableCell>
                    <TableCell>{project.floorsCount}</TableCell>
                    <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Users with access to this client</CardDescription>
          </div>
          <Link href={`/admin/clients/${clientId}/users/new`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No users yet
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: any; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
