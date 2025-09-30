import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener un edificio específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const edificio = await prisma.edificio.findUnique({
      where: { id },
      include: {
        usuarios: {
          include: {
            usuario: {
              select: {
                email: true
              }
            }
          }
        },
        salas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true
          }
        }
      }
    })

    if (!edificio) {
      return NextResponse.json({ error: 'Edificio no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario tenga acceso a este edificio
    const hasAccess = edificio.usuarios.some(ue => ue.usuario.email === session.user.email)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Sin permisos para este edificio' }, { status: 403 })
    }

    return NextResponse.json(edificio)
  } catch (error) {
    console.error('Error fetching edificio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar un edificio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, direccion, descripcion } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar que el edificio existe y que el usuario tiene acceso
    const edificioExistente = await prisma.edificio.findUnique({
      where: { id },
      include: {
        usuarios: {
          include: {
            usuario: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })

    if (!edificioExistente) {
      return NextResponse.json({ error: 'Edificio no encontrado' }, { status: 404 })
    }

    const hasAccess = edificioExistente.usuarios.some(ue => ue.usuario.email === session.user.email)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Sin permisos para este edificio' }, { status: 403 })
    }

    const edificio = await prisma.edificio.update({
      where: { id },
      data: {
        nombre,
        direccion,
        descripcion
      }
    })

    return NextResponse.json(edificio)
  } catch (error) {
    console.error('Error updating edificio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar un edificio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el edificio existe y que el usuario tiene acceso
    const edificioExistente = await prisma.edificio.findUnique({
      where: { id },
      include: {
        usuarios: {
          include: {
            usuario: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })

    if (!edificioExistente) {
      return NextResponse.json({ error: 'Edificio no encontrado' }, { status: 404 })
    }

    const hasAccess = edificioExistente.usuarios.some(ue => ue.usuario.email === session.user.email)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Sin permisos para este edificio' }, { status: 403 })
    }

    await prisma.edificio.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Edificio eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting edificio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}