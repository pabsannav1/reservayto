'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PublicCalendar from './components/PublicCalendar'
import { LogOut, Settings } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = session.user.rol === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Reservas Municipal
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {session.user.name} ({isAdmin ? 'Administrador' : 'Usuario'})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Administrar
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <PublicCalendar />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Sistema de Reservas Municipal - Vista de Calendarios
          </p>
        </div>
      </footer>
    </div>
  )
}
