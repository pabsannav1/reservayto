import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener una sala específica
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

    const sala = await prisma.sala.findUnique({
      where: { id },
      include: {
        edificio: {
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
        }
      }
    })

    if (!sala) {
      return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
    }

    // Verificar que el usuario tenga acceso a esta sala (a través del edificio)
    const hasAccess = sala.edificio.usuarios.some(ue => ue.usuario.email === session.user.email)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Sin permisos para esta sala' }, { status: 403 })
    }

    return NextResponse.json(sala)
  } catch (error) {
    console.error('Error fetching sala:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar una sala
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
    const { nombre, capacidad, equipamiento, color } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar que la sala existe y que el usuario tiene acceso
    const salaExistente = await prisma.sala.findUnique({
      where: { id },
      include: {
        edificio: {
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
        }
      }
    })

    if (!salaExistente) {
      return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
    }

    const hasAccess = salaExistente.edificio.usuarios.some(ue => ue.usuario.email === session.user.email)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Sin permisos para esta sala' }, { status: 403 })
    }

    const sala = await prisma.sala.update({
      where: { id },
      data: {
        nombre,
        capacidad,
        equipamiento,
        color
      },
      include: {
        edificio: true
      }
    })

    return NextResponse.json(sala)
  } catch (error) {
    console.error('Error updating sala:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar una sala
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la sala existe y que el usuario tiene acceso
    const salaExistente = await prisma.sala.findUnique({
      where: { id },
      include: {
        edificio: {
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
        }
      }
    })

    if (!salaExistente) {
      return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
    }

    const hasAccess = salaExistente.edificio.usuarios.some(ue => ue.usuario.email === session.user.email)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Sin permisos para esta sala' }, { status: 403 })
    }

    await prisma.sala.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Sala eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting sala:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}