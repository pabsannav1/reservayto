'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Plus, Eye, Edit, Trash2, Building2, Users } from 'lucide-react'

interface Reserva {
  id: string
  descripcion?: string
  fechaInicio: string
  fechaFin: string
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'
  sala: {
    id: string
    nombre: string
    edificio: {
      nombre: string
    }
  }
  usuario: {
    nombre: string
    email: string
  }
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    try {
      const response = await fetch('/api/reservas')
      if (response.ok) {
        const data = await response.json()
        setReservas(data)
      } else {
        setError('Error al cargar las reservas')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReserva = async (reservaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      return
    }

    try {
      const response = await fetch(`/api/reservas/${reservaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReservas(reservas.filter(r => r.id !== reservaId))
      } else {
        alert('Error al eliminar la reserva')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const reservasFiltradas = filtroEstado
    ? reservas.filter(reserva => reserva.estado === filtroEstado)
    : reservas

  const getEstadoBadge = (estado: string) => {
    const styles = {
      CONFIRMADA: 'bg-green-100 text-green-800',
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      CANCELADA: 'bg-red-100 text-red-800'
    }
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando reservas...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-8 h-8 mr-3 text-purple-600" />
                  Gestión de Reservas
                </h1>
                <p className="text-sm text-gray-600">Administrar todas las reservas de salas</p>
              </div>
            </div>
            <Link
              href="/admin/reservas/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reserva
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label htmlFor="estado" className="text-sm font-medium text-gray-700">
                Filtrar por estado:
              </label>
              <select
                id="estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los estados</option>
                <option value="CONFIRMADA">Confirmadas</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="CANCELADA">Canceladas</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Total: {reservasFiltradas.length} reservas
            </div>
          </div>
        </div>

        {/* Lista de Reservas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {reservasFiltradas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservasFiltradas.map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reserva.descripcion || 'Sin descripción'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {reserva.id.slice(-8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reserva.sala.edificio.nombre}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {reserva.sala.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Inicio: {formatDateTime(reserva.fechaInicio)}</div>
                          <div>Fin: {formatDateTime(reserva.fechaFin)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(reserva.estado)}`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reserva.usuario.nombre}</div>
                        <div className="text-sm text-gray-500">{reserva.usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/reservas/${reserva.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteReserva(reserva.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay reservas {filtroEstado && `con estado "${filtroEstado.toLowerCase()}"`}
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando una nueva reserva para gestionar las salas.
              </p>
              <Link
                href="/admin/reservas/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Reserva
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}