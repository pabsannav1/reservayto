import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public API routes
        if (req.nextUrl.pathname.startsWith('/api/edificios') ||
            req.nextUrl.pathname.startsWith('/api/salas') ||
            req.nextUrl.pathname.startsWith('/api/reservas/public') ||
            req.nextUrl.pathname.startsWith('/api/public/')) {
          return true
        }

        // Require authentication for admin routes and other API routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/reservas/:path*',
    '/api/edificios/:path*',
    '/api/salas/:path*',
  ]
}