// D3, D5 CU6 — BaseDatos: abstracción de acceso a datos del módulo Administración de Conductores
import { prisma } from '@/lib/prisma'
import { EstadoConductor, FrecuenciaHorario } from '@prisma/client'
import { Conductor } from '@/models/conductores/Conductor'
import { AsignacionConductorViaje } from '@/models/conductores/AsignacionConductorViaje'

// Convierte un campo @db.Time de Prisma a minutos desde medianoche (UTC)
function minutosDesde(t: Date): number {
    return t.getUTCHours() * 60 + t.getUTCMinutes()
}

export class BaseDatos {

    // D3: guardarConductor(cond: Conductor): boolean
    async guardarConductor(conductor: Conductor): Promise<boolean> {
        try {
            await prisma.conductor.create({
                data: {
                    conductorID: conductor.getConductorID(),
                    nombreCompleto: conductor.getNombreCompleto(),
                    curp: conductor.getCURP(),
                    numeroLicencia: conductor.getNumeroLicencia(),
                    vigenciaLicencia: conductor.getVigenciaLicencia(),
                    domicilio: conductor.getDomicilio() || null,
                    numeroTelefonico: conductor.getNumeroTelefonico() || null,
                },
            })
            return true
        } catch {
            return false
        }
    }

    // D3: guardarCambios(cond: Conductor): boolean
    async guardarCambios(conductor: Conductor): Promise<boolean> {
        try {
            await prisma.conductor.update({
                where: { conductorID: conductor.getConductorID() },
                data: {
                    nombreCompleto: conductor.getNombreCompleto(),
                    domicilio: conductor.getDomicilio() || null,
                    numeroTelefonico: conductor.getNumeroTelefonico() || null,
                    vigenciaLicencia: conductor.getVigenciaLicencia(),
                    estado: conductor.getEstado(),
                    motivoBaja: conductor.getMotivoBaja(),
                    disponible: conductor.getEstado() === EstadoConductor.ACTIVO,
                },
            })
            return true
        } catch {
            return false
        }
    }

    // D3: guardarAsignacion(CV: AsignacionConductorViaje): boolean — crea o actualiza para reasignación
    async guardarAsignacion(asig: AsignacionConductorViaje): Promise<boolean> {
        try {
            const conductorID = asig.getConductor()?.getConductorID()
            const horarioID = asig.getViaje()?.getIdViaje()
            if (!conductorID || !horarioID) return false

            const existente = await prisma.asignacionConductorViaje.findFirst({ where: { horarioID } })
            if (existente) {
                await prisma.asignacionConductorViaje.updateMany({
                    where: { horarioID },
                    data: {
                        conductorID,
                        fechaAsignacion: new Date(),
                        observaciones: asig.getObservaciones() || null,
                        liberado: false,
                        fechaLiberacion: null,
                    },
                })
            } else {
                await prisma.asignacionConductorViaje.create({
                    data: {
                        asignacionID: asig.getIdAsignacion(),
                        conductorID,
                        horarioID,
                        observaciones: asig.getObservaciones() || undefined,
                    },
                })
            }
            return true
        } catch {
            return false
        }
    }

    // D3: obtenerConductoresRegistrados(): List
    async obtenerConductoresRegistrados() {
        return prisma.conductor.findMany({ orderBy: { nombreCompleto: 'asc' } })
    }

    // D3: obtenerConductoresDisponibles(fecha: Date): List
    async obtenerConductoresDisponibles() {
        return prisma.conductor.findMany({
            where: { estado: EstadoConductor.ACTIVO },
            orderBy: { nombreCompleto: 'asc' },
        })
    }

    // D7: obtenerConductoresParaViaje(horarioID) — filtra ACTIVO + licencia vigente + sin choque de horario
    async obtenerConductoresParaViaje(horarioID: string) {
        const horario = await prisma.horario.findUnique({
            where: { horarioID },
            include: { ruta: true },
        })
        if (!horario) return []

        const hoy = new Date()

        // Pre-filtro en BD: descarta asignaciones cuya vigencia ya terminó antes del inicio del nuevo horario
        const asignaciones = await prisma.asignacionConductorViaje.findMany({
            where: {
                liberado: false,
                horarioID: { not: horarioID },
                horario: { OR: [{ fechaFin: null }, { fechaFin: { gte: horario.fechaInicio } }] },
            },
            include: { horario: { include: { ruta: true } } },
        })

        const finNuevo = horario.fechaFin ?? new Date('9999-12-31')
        const iNuevo = minutosDesde(horario.horaSalida)
        const fNuevo = iNuevo + Number(horario.ruta.tiempoEstimadoHrs) * 60

        const idsConChoque = asignaciones
            .filter(a => {
                const h = a.horario
                // Periodos de vigencia deben solaparse
                const finH = h.fechaFin ?? new Date('9999-12-31')
                if (h.fechaInicio > finNuevo || horario.fechaInicio > finH) return false

                // SEMANAL solo corre el día de la semana de su fechaInicio
                const hSem = h.frecuencia === FrecuenciaHorario.SEMANAL
                const nSem = horario.frecuencia === FrecuenciaHorario.SEMANAL
                if (hSem || nSem) {
                    if (hSem && nSem) {
                        if (h.fechaInicio.getUTCDay() !== horario.fechaInicio.getUTCDay()) return false
                    } else if (hSem && horario.frecuencia === FrecuenciaHorario.UNICO) {
                        if (horario.fechaInicio.getUTCDay() !== h.fechaInicio.getUTCDay()) return false
                    } else if (nSem && h.frecuencia === FrecuenciaHorario.UNICO) {
                        if (h.fechaInicio.getUTCDay() !== horario.fechaInicio.getUTCDay()) return false
                    }
                    // SEMANAL + DIARIO: coinciden en el día de la semana dentro del periodo → choque posible
                }

                // Choque de horas reales: [salida, salida + duración) debe solaparse
                if (!h.ruta) return false
                const iH = minutosDesde(h.horaSalida)
                const fH = iH + Number(h.ruta.tiempoEstimadoHrs) * 60
                return iH < fNuevo && iNuevo < fH
            })
            .map(a => a.conductorID)

        return prisma.conductor.findMany({
            where: {
                estado: EstadoConductor.ACTIVO,
                vigenciaLicencia: { gt: hoy },
                ...(idsConChoque.length > 0 ? { conductorID: { notIn: idsConChoque } } : {}),
            },
            orderBy: { nombreCompleto: 'asc' },
        })
    }

    // D3, D6: obtenerViajesProgramados(): List — incluye viajes con conductor para reasignación
    async obtenerViajesProgramados() {
        const hoy = new Date()
        hoy.setUTCHours(0, 0, 0, 0)

        return prisma.horario.findMany({
            where: {
                estado: 'ACTIVO',
                AND: [
                    // Vigencia no expirada
                    { OR: [{ fechaFin: null }, { fechaFin: { gte: hoy } }] },
                    // UNICO que ya pasó no aparece; DIARIO/SEMANAL siempre pasan este filtro
                    { OR: [
                        { frecuencia: { not: FrecuenciaHorario.UNICO } },
                        { fechaInicio: { gte: hoy } },
                    ]},
                ],
            },
            include: { ruta: true, conductor: true, asignacionConductorViaje: { include: { conductor: true } } },
            orderBy: { fechaInicio: 'asc' },
        })
    }

    // D3: verificarViajeActivo(cond, viaje): boolean
    async verificarViajeActivo(conductorID: string): Promise<boolean> {
        const activa = await prisma.asignacionConductorViaje.findFirst({
            where: { conductorID, liberado: false },
        })
        return activa !== null
    }

    // D3: verificarChoqueHorario(cond, viaje): boolean — E5
    async verificarChoqueHorario(conductorID: string, horarioID: string): Promise<boolean> {
        const horarioNuevo = await prisma.horario.findUnique({
            where: { horarioID },
            include: { ruta: true },
        })
        if (!horarioNuevo) return true

        const activas = await prisma.asignacionConductorViaje.findMany({
            where: { conductorID, liberado: false, horarioID: { not: horarioID } },
            include: { horario: { include: { ruta: true } } },
        })

        const finNuevo = horarioNuevo.fechaFin ?? new Date('9999-12-31')
        const iNuevo = minutosDesde(horarioNuevo.horaSalida)
        const fNuevo = iNuevo + Number(horarioNuevo.ruta.tiempoEstimadoHrs) * 60

        return activas.some(a => {
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

    // D3: verificarDuplicidad(CURP: String, licencia: String): boolean
    async verificarDuplicidad(curp: string, licencia: string, excludeID?: string): Promise<boolean> {
        const where = {
            OR: [{ curp }, { numeroLicencia: licencia }],
            ...(excludeID ? { NOT: { conductorID: excludeID } } : {}),
        }
        const existente = await prisma.conductor.findFirst({ where })
        return existente !== null
    }
}
