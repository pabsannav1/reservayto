import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// GET - Obtener todas las reservas (requiere autenticación)
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
                            edificio: true
                          }
                        },
                        usuario: {
                          select: {
                            nombre: true,
                            email: true
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
    console.error('Error fetching reservas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nueva reserva (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { salaId, fechaInicio, fechaFin, descripcion } = body

    if (!salaId || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: 'Sala, fecha de inicio y fin son requeridas' }, { status: 400 })
    }

    // Verificar que las fechas son válidas
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (inicio >= fin) {
      return NextResponse.json({ error: 'La fecha de fin debe ser posterior a la de inicio' }, { status: 400 })
    }

    if (inicio < new Date()) {
      return NextResponse.json({ error: 'No se pueden crear reservas en el pasado' }, { status: 400 })
    }

    // Obtener el usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      include: {
        edificios: {
          include: {
            edificio: {
              include: {
                salas: true
              }
            }
          }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario tiene acceso a esta sala
    const salaAccesible = usuario.edificios.some(ue =>
      ue.edificio.salas.some(sala => sala.id === salaId)
    )

    if (!salaAccesible) {
      return NextResponse.json({ error: 'Sin permisos para esta sala' }, { status: 403 })
    }

    // Verificar que no hay conflictos de horario
    const conflicto = await prisma.reserva.findFirst({
      where: {
        salaId: salaId,
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        },
        OR: [
          {
            AND: [
              { fechaInicio: { lte: inicio } },
              { fechaFin: { gt: inicio } }
            ]
          },
          {
            AND: [
              { fechaInicio: { lt: fin } },
              { fechaFin: { gte: fin } }
            ]
          },
          {
            AND: [
              { fechaInicio: { gte: inicio } },
              { fechaFin: { lte: fin } }
            ]
          }
        ]
      }
    })

    if (conflicto) {
      return NextResponse.json({ error: 'Ya existe una reserva en ese horario' }, { status: 409 })
    }

    const reserva = await prisma.reserva.create({
      data: {
        salaId,
        usuarioId: usuario.id,
        fechaInicio: inicio,
        fechaFin: fin,
        descripcion,
        estado: 'CONFIRMADA'
      },
      include: {
        sala: {
          include: {
            edificio: true
          }
        },
        usuario: {
          select: {
            nombre: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(reserva, { status: 201 })
  } catch (error) {
    console.error('Error creating reserva:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}