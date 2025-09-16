'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

interface Edificio {
  id: string
  nombre: string
}

export default function NewSalaPage() {
  const [nombre, setNombre] = useState('')
  const [edificioId, setEdificioId] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [equipamiento, setEquipamiento] = useState('')
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingEdificios, setLoadingEdificios] = useState(true)
  const [error, setError] = useState('')

  const router = useRouter()

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
      setLoadingEdificios(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/salas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          edificioId,
          capacidad: capacidad ? parseInt(capacidad) : null,
          equipamiento: equipamiento || null
        })
      })

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al crear la sala')
      }
    } catch (error) {
      setError('Error de conexión')
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
                  Nueva Sala
                </h1>
                <p className="text-sm text-gray-600">Añadir una nueva sala a un edificio</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="edificio" className="block text-sm font-medium text-gray-700 mb-2">
                Edificio *
              </label>
              {loadingEdificios ? (
                <div className="text-sm text-gray-500">Cargando edificios...</div>
              ) : (
                <select
                  id="edificio"
                  value={edificioId}
                  onChange={(e) => setEdificioId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Selecciona un edificio</option>
                  {edificios.map((edificio) => (
                    <option key={edificio.id} value={edificio.id}>
                      {edificio.nombre}
                    </option>
                  ))}
                </select>
              )}
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
                placeholder="Ej. Salón de Plenos, Sala de Reuniones A..."
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
                placeholder="Ej. 50"
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
                placeholder="Descripción del equipamiento disponible: proyector, sistema de sonido, mesas, sillas..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Link
                href="/admin"
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || !nombre.trim() || !edificioId}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Sala'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}