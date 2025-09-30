import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener reservas públicas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edificioId = searchParams.get('edificioId')
    const salaIds = searchParams.getAll('salaIds')

    // Construir el filtro WHERE
    const where: {
      estado: 'CONFIRMADA';
      salaId?: { in: string[] } | string;
      sala?: { edificioId: string };
    } = {
      estado: 'CONFIRMADA' // Solo mostrar reservas confirmadas en vista pública
    }

    if (salaIds.length > 0) {
      where.salaId = {
        in: salaIds
      }
    } else if (edificioId) {
      where.sala = {
        edificioId: edificioId
      }
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        sala: {
          include: {
            edificio: true
          }
        }
      },
      orderBy: {
        fechaInicio: 'asc'
      }
    })

    return NextResponse.json(reservas)
  } catch (error) {
    console.error('Error fetching public reservas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}