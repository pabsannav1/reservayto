import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener edificios del usuario autenticado
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      include: {
        edificios: {
          include: {
            edificio: {
              include: {
                _count: {
                  select: { salas: true }
                }
              }
            }
          }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const edificios = usuario.edificios.map(ue => ue.edificio)
    return NextResponse.json(edificios)
  } catch (error) {
    console.error('Error fetching user edificios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}