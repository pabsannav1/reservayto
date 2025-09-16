'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Eye, EyeOff } from 'lucide-react'

interface Edificio {
  id: string
  nombre: string
  direccion?: string
}

export default function NewUsuarioPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [edificiosSeleccionados, setEdificiosSeleccionados] = useState<Set<string>>(new Set())
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

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(password)
    setShowPassword(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos son requeridos')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          password,
          edificiosIds: Array.from(edificiosSeleccionados)
        })
      })

      if (response.ok) {
        router.push('/admin/usuarios')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al crear el usuario')
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
                href="/admin/usuarios"
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="w-8 h-8 mr-3 text-indigo-600" />
                  Nuevo Usuario
                </h1>
                <p className="text-sm text-gray-600">Crear un nuevo usuario del sistema</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="usuario@ayuntamiento.es"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 py-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Generar contraseña segura
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
                disabled={loading || !nombre.trim() || !email.trim() || !password.trim()}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}