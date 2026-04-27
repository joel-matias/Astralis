// D5 CU4 — consulta Horario+Ruta proyectados como Viaje para el POS
import { prisma } from '@/lib/prisma'
import { EstadoHorario, EstadoRuta, FrecuenciaHorario } from '@prisma/client'

export interface ViajeData {
    horarioID: string
    autobusID: string
    origen: string
    destino: string
    fecha: string
    hora: string
    tipoServicio: string
    precio: number
    asientosLibres: number
}

function formatHora(d: Date): string {
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
}

const TIPO_SERVICIO: Record<string, string> = { ECONOMICO: 'Económico', EJECUTIVO: 'Ejecutivo', LUJO: 'Lujo' }

export class ViajeRepository {

    async buscarViajes(origen: string, destino: string, fecha: Date, minAsientos: number): Promise<ViajeData[]> {
        const inicio = new Date(fecha); inicio.setUTCHours(0, 0, 0, 0)
        const fin    = new Date(fecha); fin.setUTCHours(23, 59, 59, 999)
        const diaUTC = inicio.getUTCDay()

        // Trae todos los activos de la ruta cuyo inicio ya llegó y cuya vigencia no expiró
        const candidatos = await prisma.horario.findMany({
            where: {
                estado:  EstadoHorario.ACTIVO,
                ruta:    { ciudadOrigen: origen, ciudadDestino: destino, estado: EstadoRuta.ACTIVA },
                fechaInicio: { lte: fin },
                OR: [{ fechaFin: null }, { fechaFin: { gte: inicio } }],
            },
            include: {
                ruta:    { select: { ciudadOrigen: true, ciudadDestino: true, tarifaBase: true } },
                autobus: { select: { capacidadAsientos: true, tipoServicio: true } },
                _count:  { select: { boletos: { where: { estado: { not: 'CANCELADO' } } } } },
            },
        })

        const fechaStr = inicio.toISOString().split('T')[0]

        return candidatos
            .filter(h => {
                if (h.frecuencia === FrecuenciaHorario.UNICO)   return h.fechaInicio >= inicio && h.fechaInicio <= fin
                if (h.frecuencia === FrecuenciaHorario.SEMANAL) return h.fechaInicio.getUTCDay() === diaUTC
                return true // DIARIO: ya pasa el filtro de BD
            })
            .map(h => ({
                horarioID:      h.horarioID,
                autobusID:      h.autobusID,
                origen:         h.ruta.ciudadOrigen,
                destino:        h.ruta.ciudadDestino,
                fecha:          fechaStr,
                hora:           formatHora(h.horaSalida),
                tipoServicio:   TIPO_SERVICIO[h.autobus.tipoServicio] ?? h.autobus.tipoServicio,
                precio:         Number(h.ruta.tarifaBase),
                asientosLibres: h.autobus.capacidadAsientos - h._count.boletos,
            }))
            .filter(v => v.asientosLibres >= minAsientos)
    }

    async obtenerOrigenes(): Promise<string[]> {
        const rutas = await prisma.ruta.findMany({
            where: { estado: EstadoRuta.ACTIVA },
            select: { ciudadOrigen: true },
            distinct: ['ciudadOrigen'],
            orderBy: { ciudadOrigen: 'asc' },
        })
        return rutas.map(r => r.ciudadOrigen)
    }

    async obtenerDestinos(origen: string): Promise<string[]> {
        const rutas = await prisma.ruta.findMany({
            where: { estado: EstadoRuta.ACTIVA, ciudadOrigen: origen },
            select: { ciudadDestino: true },
            distinct: ['ciudadDestino'],
            orderBy: { ciudadDestino: 'asc' },
        })
        return rutas.map(r => r.ciudadDestino)
    }
}
