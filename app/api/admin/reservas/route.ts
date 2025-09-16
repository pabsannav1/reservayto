import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener reservas de las salas del usuario autenticado
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
                salas: {
                  include: {
                    reservas: {
                      include: {
                        sala: {
                          include: {
                            edificio: {
                              select: {
                                nombre: true
                              }
                            }
                          }
                        }
                      },
                      orderBy: {
                        fechaInicio: 'desc'
                      }
                    }
                  }
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

    const reservas = usuario.edificios.flatMap(ue =>
      ue.edificio.salas.flatMap(sala => sala.reservas)
    )

    return NextResponse.json(reservas)
  } catch (error) {
    console.error('Error fetching user reservas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}