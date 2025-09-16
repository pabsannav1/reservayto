import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener todas las salas (público)
export async function GET() {
  try {
    const salas = await prisma.sala.findMany({
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