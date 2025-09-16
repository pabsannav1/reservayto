import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos existentes
  await prisma.reserva.deleteMany()
  await prisma.horarioSala.deleteMany()
  await prisma.sala.deleteMany()
  await prisma.usuarioEdificio.deleteMany()
  await prisma.edificio.deleteMany()
  await prisma.usuario.deleteMany()

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const usuario1 = await prisma.usuario.create({
    data: {
      nombre: 'Admin Municipal',
      email: 'admin@ayuntamiento.es',
      password: hashedPassword
    }
  })

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre: 'Gestor Deportes',
      email: 'deportes@ayuntamiento.es',
      password: hashedPassword
    }
  })

  // Crear edificios
  const ayuntamiento = await prisma.edificio.create({
    data: {
      nombre: 'Ayuntamiento',
      direccion: 'Plaza Mayor, 1',
      descripcion: 'Edificio principal del ayuntamiento'
    }
  })

  const centroDeportes = await prisma.edificio.create({
    data: {
      nombre: 'Centro de Deportes Municipal',
      direccion: 'Calle Deportiva, 25',
      descripcion: 'Instalaciones deportivas municipales'
    }
  })

  const centroCultural = await prisma.edificio.create({
    data: {
      nombre: 'Centro Cultural',
      direccion: 'Avenida de la Cultura, 10',
      descripcion: 'Espacio para eventos culturales y sociales'
    }
  })

  // Asociar usuarios con edificios
  await prisma.usuarioEdificio.create({
    data: {
      usuarioId: usuario1.id,
      edificioId: ayuntamiento.id
    }
  })

  await prisma.usuarioEdificio.create({
    data: {
      usuarioId: usuario1.id,
      edificioId: centroCultural.id
    }
  })

  await prisma.usuarioEdificio.create({
    data: {
      usuarioId: usuario2.id,
      edificioId: centroDeportes.id
    }
  })

  // Crear salas del Ayuntamiento
  const salonPlenos = await prisma.sala.create({
    data: {
      nombre: 'Salón de Plenos',
      edificioId: ayuntamiento.id,
      capacidad: 50,
      equipamiento: 'Sistema de sonido, proyector, mesa presidencial'
    }
  })

  const salaReuniones1 = await prisma.sala.create({
    data: {
      nombre: 'Sala de Reuniones A',
      edificioId: ayuntamiento.id,
      capacidad: 20,
      equipamiento: 'Mesa de reuniones, proyector, pizarra'
    }
  })

  // Crear salas del Centro de Deportes
  const gimnasio = await prisma.sala.create({
    data: {
      nombre: 'Gimnasio Principal',
      edificioId: centroDeportes.id,
      capacidad: 100,
      equipamiento: 'Cancha de baloncesto, gradas, vestuarios'
    }
  })

  const salaFitness = await prisma.sala.create({
    data: {
      nombre: 'Sala de Fitness',
      edificioId: centroDeportes.id,
      capacidad: 30,
      equipamiento: 'Máquinas de ejercicio, espejos, sistema de música'
    }
  })

  // Crear salas del Centro Cultural
  const auditorium = await prisma.sala.create({
    data: {
      nombre: 'Auditorio',
      edificioId: centroCultural.id,
      capacidad: 200,
      equipamiento: 'Escenario, sistema de iluminación, sistema de sonido profesional'
    }
  })

  const salaExposiciones = await prisma.sala.create({
    data: {
      nombre: 'Sala de Exposiciones',
      edificioId: centroCultural.id,
      capacidad: 80,
      equipamiento: 'Paneles modulares, iluminación especializada'
    }
  })

  // Crear horarios para las salas (Lunes a Viernes, 8:00-20:00)
  const salas = [salonPlenos, salaReuniones1, gimnasio, salaFitness, auditorium, salaExposiciones]

  for (const sala of salas) {
    for (let dia = 1; dia <= 5; dia++) { // Lunes a Viernes
      await prisma.horarioSala.create({
        data: {
          salaId: sala.id,
          diaSemana: dia,
          horaInicio: '08:00',
          horaFin: '20:00'
        }
      })
    }
  }

  // Crear algunas reservas de ejemplo
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(12, 0, 0, 0)

  await prisma.reserva.create({
    data: {
      salaId: salonPlenos.id,
      usuarioId: usuario1.id,
      fechaInicio: tomorrow,
      fechaFin: tomorrowEnd,
      descripcion: 'Pleno Ordinario Municipal',
      estado: 'CONFIRMADA'
    }
  })

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(16, 0, 0, 0)

  const nextWeekEnd = new Date(nextWeek)
  nextWeekEnd.setHours(18, 0, 0, 0)

  await prisma.reserva.create({
    data: {
      salaId: gimnasio.id,
      usuarioId: usuario2.id,
      fechaInicio: nextWeek,
      fechaFin: nextWeekEnd,
      descripcion: 'Entrenamiento Equipo Baloncesto',
      estado: 'CONFIRMADA'
    }
  })

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setHours(19, 0, 0, 0)

  const nextMonthEnd = new Date(nextMonth)
  nextMonthEnd.setHours(21, 0, 0, 0)

  await prisma.reserva.create({
    data: {
      salaId: auditorium.id,
      usuarioId: usuario1.id,
      fechaInicio: nextMonth,
      fechaFin: nextMonthEnd,
      descripcion: 'Concierto Banda Municipal',
      estado: 'CONFIRMADA'
    }
  })

  console.log('✅ Datos de prueba creados exitosamente')
  console.log('👤 Usuario de prueba: admin@ayuntamiento.es / admin123')
  console.log('👤 Usuario deportes: deportes@ayuntamiento.es / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })