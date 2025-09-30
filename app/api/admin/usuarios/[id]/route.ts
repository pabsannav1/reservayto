import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Obtener un usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const usuario = await prisma.usuario.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        edificios: {
          include: {
            edificio: {
              select: {
                id: true,
                nombre: true,
                direccion: true
              }
            }
          }
        },
        _count: {
          select: {
            reservas: true
          }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error fetching usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar un usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { nombre, email, password, edificiosIds } = body

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!usuarioExistente) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que el email no está siendo usado por otro usuario
    if (email !== usuarioExistente.email) {
      const emailEnUso = await prisma.usuario.findUnique({
        where: { email }
      })

      if (emailEnUso) {
        return NextResponse.json({ error: 'El email ya está siendo usado por otro usuario' }, { status: 409 })
      }
    }

    // Preparar datos de actualización
    const updateData: {
      nombre: string;
      email: string;
      password?: string;
    } = {
      nombre,
      email
    }

    // Si se proporciona nueva contraseña, hashearla
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Actualizar usuario
    const usuario = await prisma.usuario.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    // Actualizar asociaciones con edificios
    if (Array.isArray(edificiosIds)) {
      // Eliminar asociaciones existentes
      await prisma.usuarioEdificio.deleteMany({
        where: { usuarioId: resolvedParams.id }
      })

      // Crear nuevas asociaciones
      if (edificiosIds.length > 0) {
        await Promise.all(
          edificiosIds.map((edificioId: string) =>
            prisma.usuarioEdificio.create({
              data: {
                usuarioId: resolvedParams.id,
                edificioId
              }
            })
          )
        )
      }
    }

    // Retornar usuario actualizado con edificios
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        updatedAt: true,
        edificios: {
          include: {
            edificio: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(usuarioCompleto)
  } catch (error) {
    console.error('Error updating usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar un usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            reservas: true
          }
        }
      }
    })

    if (!usuarioExistente) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Prevenir que se elimine a sí mismo
    if (usuarioExistente.email === session.user.email) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
    }

    // Verificar si tiene reservas activas
    if (usuarioExistente._count.reservas > 0) {
      return NextResponse.json({
        error: 'No se puede eliminar un usuario con reservas asociadas. Elimina primero sus reservas.'
      }, { status: 400 })
    }

    // Eliminar usuario (las asociaciones se eliminan automáticamente por CASCADE)
    await prisma.usuario.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}