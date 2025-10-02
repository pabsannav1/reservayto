import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener salas de edificios asignados al usuario autenticado
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener edificios asignados al usuario
    const usuarioConEdificios = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      include: {
        edificios: {
          select: {
            edificioId: true
          }
        }
      }
    })

    if (!usuarioConEdificios) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const edificioIds = usuarioConEdificios.edificios.map(ue => ue.edificioId)

    // Obtener salas solo de los edificios asignados
    const salas = await prisma.sala.findMany({
      where: {
        edificioId: {
          in: edificioIds
        }
      },
      include: {
        edificio: true
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json(salas)
  } catch (error) {
    console.error('Error fetching salas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nueva sala (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, edificioId, capacidad, equipamiento } = body

    if (!nombre || !edificioId) {
      return NextResponse.json({ error: 'El nombre y edificio son requeridos' }, { status: 400 })
    }

    const sala = await prisma.sala.create({
      data: {
        nombre,
        edificioId,
        capacidad,
        equipamiento
      },
      include: {
        edificio: true
      }
    })

    return NextResponse.json(sala, { status: 201 })
  } catch (error) {
    console.error('Error creating sala:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}