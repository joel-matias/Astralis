// D7 CU6 — RepoAsig: Repositorio Asignación Conductor-Viaje
import { prisma } from '@/lib/prisma'

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

    // D6: obtenerViajesProgramados() — horarios ACTIVOS que aún no tienen conductor asignado
    async findViajesProgramados() {
        return prisma.horario.findMany({
            where: {
                estado: 'ACTIVO',
                asignacionConductorViaje: null,
            },
            include: {
                ruta: true,
                conductor: true,
            },
            orderBy: { fechaInicio: 'asc' },
        })
    }

    // D3 BaseDatos: verificarChoqueHorario(cond, viaje) — detecta si el conductor ya tiene un horario que se traslapa
    async verificarChoqueHorario(conductorID: string, horarioID: string): Promise<boolean> {
        const horarioNuevo = await prisma.horario.findUnique({ where: { horarioID } })
        if (!horarioNuevo) return true

        const asignacionesActivas = await prisma.asignacionConductorViaje.findMany({
            where: { conductorID, liberado: false, horarioID: { not: horarioID } },
            include: { horario: true },
        })

        return asignacionesActivas.some(a => {
            const h = a.horario
            return (
                h.fechaInicio <= horarioNuevo.fechaInicio &&
                (h.fechaFin === null || h.fechaFin >= horarioNuevo.fechaInicio)
            )
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
