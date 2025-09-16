import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener todos los edificios (público)
export async function GET() {
  try {
    const edificios = await prisma.edificio.findMany({
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json(edificios)
  } catch (error) {
    console.error('Error fetching edificios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo edificio (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, direccion, descripcion } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const edificio = await prisma.edificio.create({
      data: {
        nombre,
        direccion,
        descripcion
      }
    })

    return NextResponse.json(edificio, { status: 201 })
  } catch (error) {
    console.error('Error creating edificio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}