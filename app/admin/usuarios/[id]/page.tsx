'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Eye, EyeOff, Save } from 'lucide-react'

interface Edificio {
  id: string
  nombre: string
  direccion?: string
}

interface Usuario {
  id: string
  nombre: string
  email: string
  createdAt: string
  updatedAt: string
  edificios: {
    edificio: {
      id: string
      nombre: string
      direccion?: string
    }
  }[]
  _count: {
    reservas: number
  }
}

export default function EditUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [edificiosSeleccionados, setEdificiosSeleccionados] = useState<Set<string>>(new Set())
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingEdificios, setLoadingEdificios] = useState(true)
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    Promise.all([fetchUsuario(), fetchEdificios()])
  }, [])

  const fetchUsuario = async () => {
    try {
      const response = await fetch(`/api/admin/usuarios/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setUsuario(data)
        setNombre(data.nombre)
        setEmail(data.email)
        const edificiosIds = data.edificios.map((rel: { edificio: { id: string } }) => rel.edificio.id)
        setEdificiosSeleccionados(new Set(edificiosIds))
      } else {
        if (response.status === 404) {
          setError('Usuario no encontrado')
        } else {
          setError('Error al cargar el usuario')
        }
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoadingData(false)
    }
  }

  const fetchEdificios = async () => {
    try {
      const response = await fetch('/api/edificios')
      if (response.ok) {
        const data = await response.json()
        setEdificios(Array.isArray(data) ? data : [])
      } else {
        console.error('Error fetching edificios')
        setEdificios([])
      }
    } catch (error) {
      console.error('Error fetching edificios:', error)
      setEdificios([])
    } finally {
      setLoadingEdificios(false)
    }
  }

  const handleEdificioToggle = (edificioId: string) => {
    const newSelection = new Set(edificiosSeleccionados)
    if (newSelection.has(edificioId)) {
      newSelection.delete(edificioId)
    } else {
      newSelection.add(edificioId)
    }
    setEdificiosSeleccionados(newSelection)
  }

  const handleToggleAll = () => {
    if (edificiosSeleccionados.size === edificios.length) {
      setEdificiosSeleccionados(new Set())
    } else {
      setEdificiosSeleccionados(new Set(edificios.map(e => e.id)))
    }
  }

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    setPin(pin)
    setShowPin(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!nombre.trim() || !email.trim()) {
      setError('Nombre y email son requeridos')
      setLoading(false)
      return
    }

    if (pin.trim() !== '' && !/^\d{4}$/.test(pin)) {
      setError('El PIN debe ser de 4 dígitos')
      setLoading(false)
      return
    }

    try {
      const updateData: {
        nombre: string;
        email: string;
        edificiosIds: string[];
        pin?: string;
      } = {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        edificiosIds: Array.from(edificiosSeleccionados)
      }

      if (pin.trim() !== '') {
        updateData.pin = pin
      }

      const response = await fetch(`/api/admin/usuarios/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        router.push('/admin/usuarios')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar el usuario')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando usuario...</div>
      </div>
    )
  }

  if (error && !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Link
            href="/admin/usuarios"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Volver a la lista de usuarios
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
                href="/admin/usuarios"
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="w-8 h-8 mr-3 text-indigo-600" />
                  Editar Usuario
                </h1>
                <p className="text-sm text-gray-600">
                  Modificar información del usuario {usuario?.nombre}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Usuario */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Actual</h3>
              {usuario && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-sm text-gray-900">{usuario.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{usuario.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Reservas Activas</label>
                    <p className="text-sm text-gray-900">{usuario._count.reservas}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Registro</label>
                    <p className="text-sm text-gray-900">{formatDate(usuario.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Última Actualización</label>
                    <p className="text-sm text-gray-900">{formatDate(usuario.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de Edición */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Información del Usuario</h3>

                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-700"
                      placeholder="Ej. Juan Pérez García"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-700"
                      placeholder="usuario@ayuntamiento.es"
                    />
                  </div>

                  <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                      Nuevo PIN (opcional, 4 dígitos)
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? "text" : "password"}
                        id="pin"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-700"
                        placeholder="Dejar vacío para mantener el actual"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="px-3 py-2 text-gray-400 hover:text-gray-600"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={generatePin}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Generar nuevo PIN aleatorio
                      </button>
                    </div>
                  </div>
                </div>

                {/* Asignación de Edificios */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Edificios Asignados</h3>
                    {!loadingEdificios && edificios.length > 0 && (
                      <button
                        type="button"
                        onClick={handleToggleAll}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {edificiosSeleccionados.size === edificios.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      </button>
                    )}
                  </div>

                  {loadingEdificios ? (
                    <div className="text-sm text-gray-500">Cargando edificios...</div>
                  ) : edificios.length > 0 ? (
                    <>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                        <div className="space-y-2">
                          {edificios.map(edificio => (
                            <label key={edificio.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={edificiosSeleccionados.has(edificio.id)}
                                onChange={() => handleEdificioToggle(edificio.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-700">{edificio.nombre}</span>
                                {edificio.direccion && (
                                  <span className="text-xs text-gray-500 block">{edificio.direccion}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {edificiosSeleccionados.size} de {edificios.length} edificios seleccionados
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No hay edificios disponibles.
                      <Link href="/admin/edificios/new" className="text-indigo-600 hover:text-indigo-500 ml-1">
                        Crear uno primero
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Link
                    href="/admin/usuarios"
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !nombre.trim() || !email.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}