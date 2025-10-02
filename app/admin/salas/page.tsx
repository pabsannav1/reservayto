'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, Building2 } from 'lucide-react'

interface Sala {
  id: string
  nombre: string
  capacidad?: number
  equipamiento?: string
  color?: string
  edificio: {
    id: string
    nombre: string
  }
}

export default function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalas()
  }, [])

  const fetchSalas = async () => {
    try {
      const response = await fetch('/api/admin/salas')
      if (response.ok) {
        const data = await response.json()
        setSalas(data)
      }
    } catch (error) {
      console.error('Error fetching salas:', error)
    } finally {
      setLoading(false)
    }
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
                  <Users className="w-8 h-8 mr-3 text-green-600" />
                  Todas las Salas
                </h1>
                <p className="text-sm text-gray-600">Gestión de salas del sistema</p>
              </div>
            </div>
            <Link
              href="/admin/salas/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sala
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Cargando salas...</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {salas.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {salas.map((sala) => (
                  <li key={sala.id}>
                    <Link
                      href={`/admin/salas/${sala.id}`}
                      className="block hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            {sala.color && (
                              <div
                                className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                                style={{ backgroundColor: sala.color }}
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {sala.nombre}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 flex items-center">
                                <Building2 className="w-4 h-4 mr-1" />
                                {sala.edificio.nombre}
                              </p>
                              {sala.equipamiento && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {sala.equipamiento}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-6">
                            {sala.capacidad && (
                              <div className="text-center">
                                <p className="text-2xl font-semibold text-gray-900">
                                  {sala.capacidad}
                                </p>
                                <p className="text-xs text-gray-500">Capacidad</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay salas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza creando una nueva sala.
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/salas/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Sala
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
