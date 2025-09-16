'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Trash2, Building2 } from 'lucide-react'

interface Sala {
  id: string
  nombre: string
  capacidad?: number
  equipamiento?: string
  edificio: {
    id: string
    nombre: string
  }
}

export default function EditSalaPage() {
  const [sala, setSala] = useState<Sala | null>(null)
  const [nombre, setNombre] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [equipamiento, setEquipamiento] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const router = useRouter()
  const params = useParams()
  const salaId = params.id as string

  useEffect(() => {
    fetchSala()
  }, [salaId])

  const fetchSala = async () => {
    try {
      const response = await fetch(`/api/salas/${salaId}`)
      if (response.ok) {
        const data = await response.json()
        setSala(data)
        setNombre(data.nombre)
        setCapacidad(data.capacidad?.toString() || '')
        setEquipamiento(data.equipamiento || '')
      } else {
        setError('Sala no encontrada')
      }
    } catch (error) {
      setError('Error al cargar la sala')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/salas/${salaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          capacidad: capacidad ? parseInt(capacidad) : null,
          equipamiento: equipamiento || null
        })
      })

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar la sala')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/salas/${salaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al eliminar la sala')
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

  if (!sala) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sala no encontrada</h2>
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
                  <Users className="w-8 h-8 mr-3 text-green-600" />
                  Editar Sala
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {sala.edificio.nombre} - {sala.nombre}
                </p>
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
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Sala</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edificio
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {sala.edificio.nombre}
              </div>
            </div>

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Sala *
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad (personas)
              </label>
              <input
                type="number"
                id="capacidad"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="equipamiento" className="block text-sm font-medium text-gray-700 mb-2">
                Equipamiento
              </label>
              <textarea
                id="equipamiento"
                value={equipamiento}
                onChange={(e) => setEquipamiento(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Eliminar sala?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción eliminará permanentemente la sala "{sala.nombre}" y todas sus reservas.
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
                Eliminar Sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}