import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea admin o tenga una key secreta
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Re-ejecutar seed
    const { exec } = require('child_process')

    return new Promise((resolve) => {
      exec('npm run db:seed', (error: any, stdout: any, stderr: any) => {
        if (error) {
          resolve(NextResponse.json({
            error: 'Seed failed',
            details: error.message
          }, { status: 500 }))
        } else {
          resolve(NextResponse.json({
            message: 'Database reseeded successfully',
            output: stdout
          }))
        }
      })
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to reseed database'
    }, { status: 500 })
  }
}