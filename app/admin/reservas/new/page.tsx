'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

interface Edificio {
  id: string
  nombre: string
}

interface Sala {
  id: string
  nombre: string
  edificioId: string
  edificio: Edificio
}

export default function NewReservaPage() {
  const [edificioId, setEdificioId] = useState('')
  const [salaId, setSalaId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [edificiosRes, salasRes] = await Promise.all([
        fetch('/api/admin/edificios'),
        fetch('/api/admin/salas')
      ])

      if (edificiosRes.ok) {
        const edificiosData = await edificiosRes.json()
        setEdificios(edificiosData)
      }

      if (salasRes.ok) {
        const salasData = await salasRes.json()
        setSalas(salasData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const salasFiltered = edificioId
    ? salas.filter(sala => sala.edificioId === edificioId)
    : salas

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!fechaInicio || !fechaFin) {
      setError('Las fechas de inicio y fin son requeridas')
      setLoading(false)
      return
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (inicio >= fin) {
      setError('La fecha de fin debe ser posterior a la de inicio')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salaId,
          fechaInicio: inicio.toISOString(),
          fechaFin: fin.toISOString(),
          descripcion: descripcion || null
        })
      })

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al crear la reserva')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // Generar datetime-local por defecto (hoy + 1 hora)
  const getDefaultStartTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1, 0, 0, 0) // Próxima hora en punto
    return now.toISOString().slice(0, 16)
  }

  const getDefaultEndTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 2, 0, 0, 0) // Dos horas desde ahora
    return now.toISOString().slice(0, 16)
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
                  Nueva Reserva
                </h1>
                <p className="text-sm text-gray-600">Reservar una sala para un evento</p>
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

            {loadingData ? (
              <div className="text-center py-4">
                <div className="text-lg">Cargando datos...</div>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="edificio" className="block text-sm font-medium text-gray-700 mb-2">
                    Edificio *
                  </label>
                  <select
                    id="edificio"
                    value={edificioId}
                    onChange={(e) => {
                      setEdificioId(e.target.value)
                      setSalaId('') // Reset sala when edificio changes
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                  >
                    <option value="">Selecciona un edificio</option>
                    {edificios.map((edificio) => (
                      <option key={edificio.id} value={edificio.id}>
                        {edificio.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sala" className="block text-sm font-medium text-gray-700 mb-2">
                    Sala *
                  </label>
                  <select
                    id="sala"
                    value={salaId}
                    onChange={(e) => setSalaId(e.target.value)}
                    required
                    disabled={!edificioId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-gray-700"
                  >
                    <option value="">Selecciona una sala</option>
                    {salasFiltered.map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        {sala.nombre}
                      </option>
                    ))}
                  </select>
                  {!edificioId && (
                    <p className="text-xs text-gray-500 mt-1">Primero selecciona un edificio</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha y Hora de Inicio *
                    </label>
                    <input
                      type="datetime-local"
                      id="fechaInicio"
                      value={fechaInicio || getDefaultStartTime()}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha y Hora de Fin *
                    </label>
                    <input
                      type="datetime-local"
                      id="fechaFin"
                      value={fechaFin || getDefaultEndTime()}
                      onChange={(e) => setFechaFin(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Evento
                  </label>
                  <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-700"
                    placeholder="Describe brevemente el evento o reunión..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Link
                    href="/admin"
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !salaId || !fechaInicio || !fechaFin}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creando...' : 'Crear Reserva'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}