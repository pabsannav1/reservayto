'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { useState, useEffect } from 'react'

interface Edificio {
  id: string
  nombre: string
}

interface Sala {
  id: string
  nombre: string
  edificioId: string
  edificio: Edificio
}

interface Reserva {
  id: string
  fechaInicio: string
  fechaFin: string
  descripcion: string
  sala: Sala
}

export default function PublicCalendar() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [filtroEdificio, setFiltroEdificio] = useState<string>('')
  const [filtroSala, setFiltroSala] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchReservas()
  }, [filtroEdificio, filtroSala])

  const fetchData = async () => {
    try {
      const [edificiosRes, salasRes] = await Promise.all([
        fetch('/api/edificios'),
        fetch('/api/salas')
      ])

      const edificiosData = await edificiosRes.json()
      const salasData = await salasRes.json()

      setEdificios(edificiosData)
      setSalas(salasData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const fetchReservas = async () => {
    try {
      let url = '/api/reservas/public'
      const params = new URLSearchParams()

      if (filtroEdificio) params.append('edificioId', filtroEdificio)
      if (filtroSala) params.append('salaId', filtroSala)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setReservas(data)
    } catch (error) {
      console.error('Error fetching reservas:', error)
    }
  }

  const salasFiltered = filtroEdificio
    ? salas.filter(sala => sala.edificioId === filtroEdificio)
    : salas

  const calendarEvents = reservas.map(reserva => ({
    id: reserva.id,
    title: `${reserva.sala.nombre} - ${reserva.descripcion || 'Reserva'}`,
    start: reserva.fechaInicio,
    end: reserva.fechaFin,
    backgroundColor: '#3b82f6',
    borderColor: '#1d4ed8',
    extendedProps: {
      sala: reserva.sala.nombre,
      edificio: reserva.sala.edificio.nombre,
      descripcion: reserva.descripcion
    }
  }))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Cargando calendario...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Filtrar por:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edificio" className="block text-sm font-medium text-gray-700 mb-2">
              Edificio
            </label>
            <select
              id="edificio"
              value={filtroEdificio}
              onChange={(e) => {
                setFiltroEdificio(e.target.value)
                setFiltroSala('') // Reset sala filter when edificio changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los edificios</option>
              {edificios.map(edificio => (
                <option key={edificio.id} value={edificio.id}>
                  {edificio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sala" className="block text-sm font-medium text-gray-700 mb-2">
              Sala
            </label>
            <select
              id="sala"
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las salas</option>
              {salasFiltered.map(sala => (
                <option key={sala.id} value={sala.id}>
                  {sala.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale={esLocale}
          events={calendarEvents}
          height="auto"
          eventClick={(info) => {
            alert(`
              Sala: ${info.event.extendedProps.sala}
              Edificio: ${info.event.extendedProps.edificio}
              Descripción: ${info.event.extendedProps.descripcion || 'Sin descripción'}
              Inicio: ${info.event.start?.toLocaleString('es-ES')}
              Fin: ${info.event.end?.toLocaleString('es-ES')}
            `)
          }}
          eventMouseEnter={(info) => {
            info.el.style.cursor = 'pointer'
          }}
        />
      </div>
    </div>
  )
}