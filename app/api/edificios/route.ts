import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener edificios asignados al usuario autenticado
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
          include: {
            edificio: true
          }
        }
      }
    })

    if (!usuarioConEdificios) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const edificios = usuarioConEdificios.edificios.map(ue => ue.edificio)

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