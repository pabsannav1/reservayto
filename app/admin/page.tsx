'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Users, Calendar, LogOut, Plus, Eye } from 'lucide-react'

interface Edificio {
  id: string
  nombre: string
  direccion?: string
  _count?: {
    salas: number
  }
}

interface Sala {
  id: string
  nombre: string
  capacidad?: number
  edificio: {
    nombre: string
  }
}

interface Reserva {
  id: string
  descripcion?: string
  fechaInicio: string
  fechaFin: string
  estado: string
  sala: {
    nombre: string
    edificio: {
      nombre: string
    }
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const [edificiosRes, salasRes, reservasRes] = await Promise.all([
        fetch('/api/admin/edificios'),
        fetch('/api/admin/salas'),
        fetch('/api/admin/reservas')
      ])

      if (edificiosRes.ok) {
        const edificiosData = await edificiosRes.json()
        setEdificios(edificiosData)
      }

      if (salasRes.ok) {
        const salasData = await salasRes.json()
        setSalas(salasData)
      }

      if (reservasRes.ok) {
        const reservasData = await reservasRes.json()
        setReservas(reservasData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  if (!session) {
    return <div className="flex justify-center items-center min-h-screen">No autorizado</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Bienvenido, {session.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver sitio público
              </Link>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="text-lg">Cargando datos...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Edificios</dt>
                        <dd className="text-lg font-medium text-gray-900">{edificios.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Salas</dt>
                        <dd className="text-lg font-medium text-gray-900">{salas.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Reservas Activas</dt>
                        <dd className="text-lg font-medium text-gray-900">{reservas.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    href="/admin/edificios/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Edificio
                  </Link>
                  <Link
                    href="/admin/salas/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Sala
                  </Link>
                  <Link
                    href="/admin/reservas/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Reserva
                  </Link>
                  <Link
                    href="/admin/reservas"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Todas las Reservas
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Edificios */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Mis Edificios</h3>
                  <div className="space-y-4">
                    {edificios.slice(0, 5).map((edificio) => (
                      <div key={edificio.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{edificio.nombre}</p>
                          <p className="text-sm text-gray-500">{edificio.direccion}</p>
                        </div>
                        <Link
                          href={`/admin/edificios/${edificio.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    ))}
                    {edificios.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No tienes edificios asignados</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Próximas Reservas */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Próximas Reservas</h3>
                  <div className="space-y-4">
                    {reservas.slice(0, 5).map((reserva) => (
                      <div key={reserva.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{reserva.descripcion || 'Sin descripción'}</p>
                          <p className="text-sm text-gray-500">
                            {reserva.sala.edificio.nombre} - {reserva.sala.nombre}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(reserva.fechaInicio).toLocaleString('es-ES')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reserva.estado === 'CONFIRMADA'
                            ? 'bg-green-100 text-green-800'
                            : reserva.estado === 'PENDIENTE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reserva.estado}
                        </span>
                      </div>
                    ))}
                    {reservas.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No hay reservas próximas</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}