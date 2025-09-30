'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Trash2, Users, MapPin } from 'lucide-react'

interface Edificio {
  id: string
  nombre: string
  direccion?: string
  descripcion?: string
  salas: {
    id: string
    nombre: string
    capacidad?: number
  }[]
}

export default function EditEdificioPage() {
  const [edificio, setEdificio] = useState<Edificio | null>(null)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const router = useRouter()
  const params = useParams()
  const resolvedParams = use(params)
  const edificioId = resolvedParams.id as string

  useEffect(() => {
    fetchEdificio()
  }, [edificioId])

  const fetchEdificio = async () => {
    try {
      const response = await fetch(`/api/edificios/${edificioId}`)
      if (response.ok) {
        const data = await response.json()
        setEdificio(data)
        setNombre(data.nombre)
        setDireccion(data.direccion || '')
        setDescripcion(data.descripcion || '')
      } else {
        setError('Edificio no encontrado')
      }
    } catch (error) {
      setError('Error al cargar el edificio')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/edificios/${edificioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          direccion,
          descripcion
        })
      })

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar el edificio')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/edificios/${edificioId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al eliminar el edificio')
      }
    } catch (error) {
      setError('Error de conexión')
    }
    setShowDeleteModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!edificio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Edificio no encontrado</h2>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-500"
          >
            Volver al dashboard
          </Link>
        </div>
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
                  <Building2 className="w-8 h-8 mr-3 text-blue-600" />
                  Editar Edificio
                </h1>
                <p className="text-sm text-gray-600">{edificio.nombre}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Edificio</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Edificio *
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Link
                  href="/admin"
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={saving || !nombre.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>

          {/* Salas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Salas del Edificio</h3>
                <Link
                  href="/admin/salas/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Añadir Sala
                </Link>
              </div>

              {edificio.salas.length > 0 ? (
                <div className="space-y-3">
                  {edificio.salas.map((sala) => (
                    <div key={sala.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{sala.nombre}</p>
                          {sala.capacidad && (
                            <p className="text-sm text-gray-500">Capacidad: {sala.capacidad} personas</p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/admin/salas/${sala.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Editar
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay salas en este edificio
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Eliminar edificio?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción eliminará permanentemente el edificio &quot;{edificio.nombre}&quot; y todas sus salas y reservas.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar Edificio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}