export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/edificios/:path*',
    '/api/salas/:path*',
    '/api/reservas/:path*',
  ]
}