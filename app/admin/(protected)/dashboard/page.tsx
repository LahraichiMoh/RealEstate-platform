'use client'

import React from "react"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Building2, Home, FileText } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/admin/login")
  }

  const userRole = (session.user as any)?.role
  const clientId = (session.user as any)?.clientId

  // Redirect based on role
  if (userRole === "SUPER_ADMIN") {
    return <SuperAdminDashboard />
  }

  return <ClientDashboard clientId={clientId} />
}

function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage all clients and their projects</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>+ Create Client</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value="3"
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Projects"
          value="8"
          icon={<Building2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Total Apartments"
          value="284"
          icon={<Home className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Total Reservations"
          value="45"
          icon={<FileText className="w-5 h-5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage all registered clients</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/clients">
              <Button variant="outline" className="w-full bg-transparent">View All Clients</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage client users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full bg-transparent">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: "Prestige", projects: 2 },
              { name: "Modern", projects: 2 },
              { name: "Luxury", projects: 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="projects" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function ClientDashboard({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your projects and sales</p>
        </div>
        <Link href="/admin/projects/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Your Projects"
          value="2"
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Apartments"
          value="72"
          icon={<Home className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Available Units"
          value="28"
          icon={<Home className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Reservations"
          value="12"
          icon={<FileText className="w-5 h-5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>View and manage your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/projects">
              <Button variant="outline" className="w-full bg-transparent">Manage Projects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Invite agents to help sell</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/team">
              <Button variant="outline" className="w-full bg-transparent">Manage Team</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie dataKey="value" data={[
                { name: "Available", value: 28 },
                { name: "Reserved", value: 32 },
                { name: "Sold", value: 12 },
              ]} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100}>
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon, color }: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
