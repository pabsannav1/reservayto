import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea admin o tenga una key secreta
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Re-ejecutar seed
    try {
      const { stdout } = await execAsync('npm run db:seed')
      return NextResponse.json({
        message: 'Database reseeded successfully',
        output: stdout
      })
    } catch (execError) {
      const error = execError as Error
      return NextResponse.json({
        error: 'Seed failed',
        details: error.message
      }, { status: 500 })
    }
  } catch {
    return NextResponse.json({
      error: 'Failed to reseed database'
    }, { status: 500 })
  }
}