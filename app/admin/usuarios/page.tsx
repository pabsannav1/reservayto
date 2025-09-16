'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, Eye, Edit, Trash2, Building2, Mail, Calendar } from 'lucide-react'

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
    }
  }[]
  _count: {
    reservas: number
  }
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      } else {
        setError('Error al cargar los usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUsuario = async (usuarioId: string, usuarioNombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${usuarioNombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/usuarios/${usuarioId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsuarios(usuarios.filter(u => u.id !== usuarioId))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al eliminar el usuario')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando usuarios...</div>
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
                  <Users className="w-8 h-8 mr-3 text-indigo-600" />
                  Gestión de Usuarios
                </h1>
                <p className="text-sm text-gray-600">Administrar usuarios del sistema</p>
              </div>
            </div>
            <Link
              href="/admin/usuarios/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
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

        {/* Stats */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total de usuarios: <span className="font-medium text-gray-900">{usuarios.length}</span>
              </div>
              <div className="text-sm text-gray-600">
                Usuarios activos: <span className="font-medium text-gray-900">
                  {usuarios.filter(u => u.edificios.length > 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {usuarios.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edificios Asignados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reservas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {usuario.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {usuario.edificios.length > 0 ? (
                            <div className="space-y-1">
                              {usuario.edificios.map((rel) => (
                                <div key={rel.edificio.id} className="flex items-center text-xs">
                                  <Building2 className="w-3 h-3 mr-1 text-gray-400" />
                                  {rel.edificio.nombre}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin edificios asignados</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {usuario._count.reservas}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(usuario.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/usuarios/${usuario.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver/Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteUsuario(usuario.id, usuario.nombre)}
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
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay usuarios registrados
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando el primer usuario del sistema.
              </p>
              <Link
                href="/admin/usuarios/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Usuario
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}