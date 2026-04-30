// D3, D5 CU6 — BaseDatos: abstracción de acceso a datos del módulo Administración de Conductores
import { prisma } from '@/lib/prisma'
import { EstadoConductor } from '@prisma/client'
import { Conductor } from '@/models/conductores/Conductor'
import { AsignacionConductorViaje } from '@/models/conductores/AsignacionConductorViaje'

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

    // D3: guardarAsignacion(CV: AsignacionConductorViaje): boolean
    async guardarAsignacion(asig: AsignacionConductorViaje): Promise<boolean> {
        try {
            const conductorID = asig.getConductor()?.getConductorID()
            const horarioID = asig.getViaje()?.getIdViaje()
            if (!conductorID || !horarioID) return false
            await prisma.asignacionConductorViaje.create({
                data: {
                    asignacionID: asig.getIdAsignacion(),
                    conductorID,
                    horarioID,
                    observaciones: asig.getObservaciones() || undefined,
                },
            })
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

    // D3, D6: obtenerViajesProgramados(): List
    async obtenerViajesProgramados() {
        return prisma.horario.findMany({
            where: { estado: 'ACTIVO', asignacionConductorViaje: null },
            include: { ruta: true, conductor: true },
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

    // D3: verificarChoqueHorario(cond, viaje): boolean
    async verificarChoqueHorario(conductorID: string, horarioID: string): Promise<boolean> {
        const horarioNuevo = await prisma.horario.findUnique({ where: { horarioID } })
        if (!horarioNuevo) return true

        const activas = await prisma.asignacionConductorViaje.findMany({
            where: { conductorID, liberado: false, horarioID: { not: horarioID } },
            include: { horario: true },
        })

        return activas.some(a => {
            const h = a.horario
            return (
                h.fechaInicio <= horarioNuevo.fechaInicio &&
                (h.fechaFin === null || h.fechaFin >= horarioNuevo.fechaInicio)
            )
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
