// D7 CU6 — RepoAsig: Repositorio Asignación Conductor-Viaje
import { prisma } from '@/lib/prisma'
import { FrecuenciaHorario } from '@prisma/client'

function minutosDesde(t: Date): number {
    return t.getUTCHours() * 60 + t.getUTCMinutes()
}

export class RepoAsig {

    // D3 BaseDatos: guardarAsignacion(CV: AsignacionConductorViaje): boolean
    async save(datos: {
        asignacionID: string
        conductorID: string
        horarioID: string
        observaciones?: string
    }) {
        return prisma.asignacionConductorViaje.create({ data: datos })
    }

    // D6: obtenerViajesProgramados() — horarios ACTIVOS; incluye asignados para reasignación
    async findViajesProgramados() {
        return prisma.horario.findMany({
            where: { estado: 'ACTIVO' },
            include: {
                ruta: true,
                conductor: true,
                asignacionConductorViaje: true,
            },
            orderBy: { fechaInicio: 'asc' },
        })
    }

    // D3 BaseDatos: verificarChoqueHorario(cond, viaje) — detecta si el conductor ya tiene un horario que se traslapa — E5
    async verificarChoqueHorario(conductorID: string, horarioID: string): Promise<boolean> {
        const horarioNuevo = await prisma.horario.findUnique({
            where: { horarioID },
            include: { ruta: true },
        })
        if (!horarioNuevo) return true

        const asignacionesActivas = await prisma.asignacionConductorViaje.findMany({
            where: { conductorID, liberado: false, horarioID: { not: horarioID } },
            include: { horario: { include: { ruta: true } } },
        })

        const finNuevo = horarioNuevo.fechaFin ?? new Date('9999-12-31')
        const iNuevo = minutosDesde(horarioNuevo.horaSalida)
        const fNuevo = iNuevo + Number(horarioNuevo.ruta.tiempoEstimadoHrs) * 60

        return asignacionesActivas.some(a => {
            const h = a.horario

            // Periodos de vigencia deben solaparse
            const finH = h.fechaFin ?? new Date('9999-12-31')
            if (h.fechaInicio > finNuevo || horarioNuevo.fechaInicio > finH) return false

            // SEMANAL solo corre el día de la semana de su fechaInicio
            const hSem = h.frecuencia === FrecuenciaHorario.SEMANAL
            const nSem = horarioNuevo.frecuencia === FrecuenciaHorario.SEMANAL
            if (hSem || nSem) {
                if (hSem && nSem) {
                    if (h.fechaInicio.getUTCDay() !== horarioNuevo.fechaInicio.getUTCDay()) return false
                } else if (hSem && horarioNuevo.frecuencia === FrecuenciaHorario.UNICO) {
                    if (horarioNuevo.fechaInicio.getUTCDay() !== h.fechaInicio.getUTCDay()) return false
                } else if (nSem && h.frecuencia === FrecuenciaHorario.UNICO) {
                    if (h.fechaInicio.getUTCDay() !== horarioNuevo.fechaInicio.getUTCDay()) return false
                }
            }

            // Choque de horas reales: [salida, salida + duración) debe solaparse
            const iH = minutosDesde(h.horaSalida)
            const fH = iH + Number(h.ruta.tiempoEstimadoHrs) * 60
            return iH < fNuevo && iNuevo < fH
        })
    }

    // D3 BaseDatos: verificarViajeActivo(cond, viaje): boolean
    async findActivaByConductor(conductorID: string) {
        return prisma.asignacionConductorViaje.findFirst({
            where: { conductorID, liberado: false },
            include: { horario: { include: { ruta: true } } },
        })
    }

    async findByConductor(conductorID: string) {
        return prisma.asignacionConductorViaje.findMany({
            where: { conductorID },
            include: { horario: { include: { ruta: true } } },
            orderBy: { fechaAsignacion: 'desc' },
        })
    }

    // D5: liberar — viaje finalizado, conductor liberado
    async liberar(asignacionID: string) {
        return prisma.asignacionConductorViaje.update({
            where: { asignacionID },
            data: { liberado: true, fechaLiberacion: new Date() },
        })
    }
}
