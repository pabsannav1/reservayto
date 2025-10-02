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
  color?: string
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
  const [salasSeleccionadas, setSalasSeleccionadas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Cuando se cargan las salas, seleccionar todas por defecto
    if (Array.isArray(salas) && salas.length > 0 && salasSeleccionadas.size === 0) {
      const salasAFiltrar = filtroEdificio
        ? salas.filter(sala => sala.edificioId === filtroEdificio)
        : salas
      const todasLasSalas = new Set(salasAFiltrar.map(sala => sala.id))
      setSalasSeleccionadas(todasLasSalas)
    }
  }, [salas, filtroEdificio, salasSeleccionadas.size])

  useEffect(() => {
    fetchReservas()
  }, [filtroEdificio, salasSeleccionadas])

  const fetchData = async () => {
    try {
      const [edificiosRes, salasRes] = await Promise.all([
        fetch('/api/edificios'),
        fetch('/api/salas')
      ])

      if (edificiosRes.ok) {
        const edificiosData = await edificiosRes.json()
        setEdificios(Array.isArray(edificiosData) ? edificiosData : [])
      } else {
        console.error('Error fetching edificios:', edificiosRes.status)
        setEdificios([])
      }

      if (salasRes.ok) {
        const salasData = await salasRes.json()
        setSalas(Array.isArray(salasData) ? salasData : [])
      } else {
        console.error('Error fetching salas:', salasRes.status)
        setSalas([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setEdificios([])
      setSalas([])
      setLoading(false)
    }
  }

  const fetchReservas = async () => {
    try {
      let url = '/api/reservas/public'
      const params = new URLSearchParams()

      if (filtroEdificio) {
        params.append('edificioId', filtroEdificio)
      } else if (salasSeleccionadas.size > 0) {
        // Si hay salas seleccionadas específicamente, las incluimos
        salasSeleccionadas.forEach(salaId => {
          params.append('salaIds', salaId)
        })
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReservas(Array.isArray(data) ? data : [])
      } else {
        console.error('Error fetching reservas:', response.status)
        setReservas([])
      }
    } catch (error) {
      console.error('Error fetching reservas:', error)
      setReservas([])
    }
  }

  const salasFiltered = Array.isArray(salas)
    ? (filtroEdificio
       ? salas.filter(sala => sala.edificioId === filtroEdificio)
       : salas)
    : []

  const handleEdificioChange = (edificioId: string) => {
    setFiltroEdificio(edificioId)
    // Resetear selección de salas cuando cambia el edificio
    setSalasSeleccionadas(new Set())
  }

  const handleSalaToggle = (salaId: string) => {
    const newSelection = new Set(salasSeleccionadas)
    if (newSelection.has(salaId)) {
      newSelection.delete(salaId)
    } else {
      newSelection.add(salaId)
    }
    setSalasSeleccionadas(newSelection)
  }

  const handleToggleAll = () => {
    if (salasSeleccionadas.size === salasFiltered.length) {
      // Deseleccionar todas
      setSalasSeleccionadas(new Set())
    } else {
      // Seleccionar todas las salas filtradas
      const todasLasSalas = new Set(salasFiltered.map(sala => sala.id))
      setSalasSeleccionadas(todasLasSalas)
    }
  }

  const calendarEvents = reservas.map(reserva => {
    const salaColor = reserva.sala.color || '#3b82f6'
    const borderColor = reserva.sala.color ? adjustColorBrightness(reserva.sala.color, -20) : '#1d4ed8'

    return {
      id: reserva.id,
      title: `${reserva.sala.nombre} - ${reserva.descripcion || 'Reserva'}`,
      start: reserva.fechaInicio,
      end: reserva.fechaFin,
      backgroundColor: salaColor,
      borderColor: borderColor,
      extendedProps: {
        sala: reserva.sala.nombre,
        edificio: reserva.sala.edificio.nombre,
        descripcion: reserva.descripcion
      }
    }
  })

  // Función auxiliar para ajustar el brillo del color
  function adjustColorBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16)
      .slice(1)
      .toUpperCase()
  }

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
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Filtrar por:</h2>

        {/* Filtro por Edificio */}
        <div className="mb-6">
          <label htmlFor="edificio" className="block text-sm font-medium text-gray-700 mb-2">
            Edificio
          </label>
          <select
            id="edificio"
            value={filtroEdificio}
            onChange={(e) => handleEdificioChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los edificios</option>
            {Array.isArray(edificios) && edificios.map(edificio => (
              <option key={edificio.id} value={edificio.id}>
                {edificio.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Salas con Checkboxes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Salas {filtroEdificio && Array.isArray(salas) && salas.some(s => s.edificioId === filtroEdificio) &&
                Array.isArray(edificios) && `(${edificios.find(e => e.id === filtroEdificio)?.nombre})`}
            </label>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {salasSeleccionadas.size === salasFiltered.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
            {Array.isArray(salasFiltered) && salasFiltered.length > 0 ? (
              <div className="space-y-2">
                {salasFiltered.map(sala => (
                  <label key={sala.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={salasSeleccionadas.has(sala.id)}
                      onChange={() => handleSalaToggle(sala.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {sala.nombre}
                      {!filtroEdificio && (
                        <span className="text-gray-500 ml-1">({sala.edificio.nombre})</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {filtroEdificio ? 'No hay salas en este edificio' : 'No hay salas disponibles'}
              </p>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {salasSeleccionadas.size} de {salasFiltered.length} salas seleccionadas
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
          slotMinTime="07:00:00"
          slotMaxTime="23:00:00"
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