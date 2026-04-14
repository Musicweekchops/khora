"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import DashboardClasses from "@/components/dashboard/DashboardClasses"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeacherDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface DashboardStats {
  activeStudents: number
  classesToday: number
  pendingBookings: number
  monthlyRevenue: number
  pendingPayments: number
  pendingPaymentsAmount: number
  currentMonth: string
}

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <>
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Alumnos Activos"
                value={stats?.activeStudents.toString() || "0"}
                subtitle="Este mes"
                icon="👥"
              />
              <StatCard
                title="Clases Hoy"
                value={stats?.classesToday.toString() || "0"}
                subtitle="Programadas"
                icon="📅"
              />
              <StatCard
                title="Bookings Pendientes"
                value={stats?.pendingBookings.toString() || "0"}
                subtitle="Por aprobar"
                icon="🔔"
                trend={stats && stats.pendingBookings > 0 ? "Ver CRM →" : undefined}
              />
              <StatCard
                title="Ingresos del Mes"
                value={stats ? formatCurrency(stats.monthlyRevenue) : "$0"}
                subtitle={stats?.currentMonth || "Este mes"}
                icon="📈"
              />
            </>
          )}
        </div>

        {/* Clase Actual + Próximas Clases */}
        <div className="mb-8">
          <DashboardClasses />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Agregar Alumno"
              description="Registrar un nuevo alumno"
              icon="➕"
              href="/dashboard/alumnos/nuevo"
            />
            <QuickActionCard
              title="Agendar Clase"
              description="Programar una nueva clase"
              icon="📅"
              href="/dashboard/clases/nueva"
            />
            <QuickActionCard
              title="Registrar Pago"
              description="Marcar un pago recibido"
              icon="💵"
              href="/dashboard/pagos/nuevo"
            />
          </div>
        </div>

        {/* Próximas Clases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🗓️</span>
              Próximas Clases de la Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-neutral-500">
              <p className="text-base mb-2">No hay clases programadas</p>
              <p className="text-sm text-neutral-400 mb-4">
                Las clases programadas aparecerán aquí
              </p>
              <Link href="/dashboard/clases/nueva">
                <Button variant="primary">
                  Agendar Primera Clase
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StatCard({ title, value, subtitle, icon, trend }: {
  title: string
  value: string
  subtitle: string
  icon: string
  trend?: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          {trend && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-success-50 text-success-600">
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-neutral-600 mb-1">{title}</h3>
        <p className="text-2xl font-semibold text-neutral-900 mb-1">{value}</p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({ title, description, icon, href }: {
  title: string
  description: string
  icon: string
  href: string
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-neutral-200 hover:border-primary-200">
        <CardContent className="p-6">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-neutral-600">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
