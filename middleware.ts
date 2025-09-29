import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Check if user has admin role for admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const token = req.nextauth.token
      if (token?.rol !== 'ADMIN') {
        return Response.redirect(new URL('/', req.url))
      }
    }

    // Check if user has admin role for admin API routes
    if (req.nextUrl.pathname.startsWith('/api/admin')) {
      const token = req.nextauth.token
      if (token?.rol !== 'ADMIN') {
        return Response.json({ error: 'Acceso denegado' }, { status: 403 })
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Require authentication for all routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)',
  ]
}