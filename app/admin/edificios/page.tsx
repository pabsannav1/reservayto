'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Plus, MapPin } from 'lucide-react'

interface Edificio {
  id: string
  nombre: string
  direccion?: string
  descripcion?: string
  _count?: {
    salas: number
    usuarios: number
  }
}

export default function EdificiosPage() {
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEdificios()
  }, [])

  const fetchEdificios = async () => {
    try {
      const response = await fetch('/api/admin/edificios')
      if (response.ok) {
        const data = await response.json()
        setEdificios(data)
      }
    } catch (error) {
      console.error('Error fetching edificios:', error)
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
                  <Building2 className="w-8 h-8 mr-3 text-blue-600" />
                  Todos los Edificios
                </h1>
                <p className="text-sm text-gray-600">Gestión de edificios del sistema</p>
              </div>
            </div>
            <Link
              href="/admin/edificios/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Edificio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Cargando edificios...</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {edificios.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {edificios.map((edificio) => (
                  <li key={edificio.id}>
                    <Link
                      href={`/admin/edificios/${edificio.id}`}
                      className="block hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {edificio.nombre}
                            </h3>
                            {edificio.direccion && (
                              <p className="mt-1 text-sm text-gray-500 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {edificio.direccion}
                              </p>
                            )}
                            {edificio.descripcion && (
                              <p className="mt-1 text-sm text-gray-600">
                                {edificio.descripcion}
                              </p>
                            )}
                          </div>
                          <div className="ml-6 flex items-center space-x-6">
                            {edificio._count && (
                              <>
                                <div className="text-center">
                                  <p className="text-2xl font-semibold text-gray-900">
                                    {edificio._count.salas}
                                  </p>
                                  <p className="text-xs text-gray-500">Salas</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-semibold text-gray-900">
                                    {edificio._count.usuarios}
                                  </p>
                                  <p className="text-xs text-gray-500">Usuarios</p>
                                </div>
                              </>
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
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay edificios</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza creando un nuevo edificio.
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/edificios/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Edificio
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
