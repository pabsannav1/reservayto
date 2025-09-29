'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        pin,
        redirect: false,
      })

      if (result?.error) {
        setError('PIN inválido')
      } else {
        router.push('/admin')
      }
    } catch (error) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acceso al Sistema
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingrese su PIN para acceder
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="pin" className="sr-only">
                PIN
              </label>
              <input
                id="pin"
                name="pin"
                type="password"
                autoComplete="off"
                required
                maxLength={4}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-lg text-center font-mono"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sistema de Reservas Municipal
          </p>
        </div>
      </div>
    </div>
  )
}