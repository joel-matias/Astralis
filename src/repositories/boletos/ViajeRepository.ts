// D5 CU4 — consulta Horario+Ruta proyectados como Viaje para el POS
import { prisma } from '@/lib/prisma'
import { EstadoHorario, EstadoRuta } from '@prisma/client'

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
        const inicio = new Date(fecha); inicio.setHours(0, 0, 0, 0)
        const fin    = new Date(fecha); fin.setHours(23, 59, 59, 999)

        const horarios = await prisma.horario.findMany({
            where: {
                estado: EstadoHorario.ACTIVO,
                ruta: { ciudadOrigen: origen, ciudadDestino: destino, estado: EstadoRuta.ACTIVA },
                OR: [
                    { frecuencia: 'UNICO',   fechaInicio: { gte: inicio, lte: fin } },
                    {
                        frecuencia: { in: ['DIARIO', 'SEMANAL'] },
                        fechaInicio: { lte: fin },
                        OR: [{ fechaFin: null }, { fechaFin: { gte: inicio } }],
                    },
                ],
            },
            include: {
                ruta:    { select: { ciudadOrigen: true, ciudadDestino: true, tarifaBase: true } },
                autobus: { select: { capacidadAsientos: true, tipoServicio: true } },
                _count:  { select: { boletos: { where: { estado: { not: 'CANCELADO' } } } } },
            },
        })

        const fechaStr = fecha.toISOString().split('T')[0]

        return horarios
            .filter(h => h.frecuencia !== 'SEMANAL' || h.fechaInicio.getDay() === fecha.getDay())
            .map(h => ({
                horarioID:     h.horarioID,
                autobusID:     h.autobusID,
                origen:        h.ruta.ciudadOrigen,
                destino:       h.ruta.ciudadDestino,
                fecha:         fechaStr,
                hora:          formatHora(h.horaSalida),
                tipoServicio:  TIPO_SERVICIO[h.autobus.tipoServicio] ?? h.autobus.tipoServicio,
                precio:        Number(h.ruta.tarifaBase),
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
