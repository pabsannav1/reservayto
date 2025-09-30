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
    const { nombre, email, password, edificiosIds } = body

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })
    }

    // Verificar que el email no existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 409 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generar PIN único de 4 dígitos
    let pin: string
    let pinExistente = true
    do {
      pin = Math.floor(1000 + Math.random() * 9000).toString()
      const existingUser = await prisma.usuario.findUnique({ where: { pin } })
      pinExistente = !!existingUser
    } while (pinExistente)

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