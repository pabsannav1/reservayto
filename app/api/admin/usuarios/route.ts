import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Obtener todos los usuarios del sistema (solo para administradores)
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const usuarios = await prisma.usuario.findMany({
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
                nombre: true
              }
            }
          }
        },
        _count: {
          select: {
            reservas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error fetching usuarios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo usuario (solo para administradores)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, email, pin, edificiosIds } = body

    if (!nombre || !email || !pin) {
      return NextResponse.json({ error: 'Nombre, email y PIN son requeridos' }, { status: 400 })
    }

    // Validar formato de PIN (4 dígitos)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'El PIN debe ser de 4 dígitos' }, { status: 400 })
    }

    // Verificar que el email no existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 409 })
    }

    // Verificar que el PIN no existe
    const pinExistente = await prisma.usuario.findUnique({
      where: { pin }
    })

    if (pinExistente) {
      return NextResponse.json({ error: 'Este PIN ya está en uso' }, { status: 409 })
    }

    // Crear password basado en el PIN (para compatibilidad con el esquema)
    const hashedPassword = await bcrypt.hash(pin, 10)

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        pin
      }
    })

    // Asociar con edificios si se proporcionaron
    if (Array.isArray(edificiosIds) && edificiosIds.length > 0) {
      await Promise.all(
        edificiosIds.map((edificioId: string) =>
          prisma.usuarioEdificio.create({
            data: {
              usuarioId: usuario.id,
              edificioId
            }
          })
        )
      )
    }

    // Retornar usuario creado con edificios
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
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

    return NextResponse.json(usuarioCompleto, { status: 201 })
  } catch (error) {
    console.error('Error creating usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}