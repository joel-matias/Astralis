// D7 CU6 — RepoCond: Repositorio Conductor
import { prisma } from '@/lib/prisma'
import { EstadoConductor } from '@prisma/client'

export class RepoCond {

    // D3 BaseDatos: obtenerConductoresRegistrados(): List
    async findAll(filtros?: { q?: string; estado?: EstadoConductor }) {
        return prisma.conductor.findMany({
            where: {
                ...(filtros?.estado ? { estado: filtros.estado } : {}),
                ...(filtros?.q ? {
                    OR: [
                        { nombreCompleto: { contains: filtros.q } },
                        { curp: { contains: filtros.q } },
                        { numeroLicencia: { contains: filtros.q } },
                    ],
                } : {}),
            },
            orderBy: { nombreCompleto: 'asc' },
        })
    }

    // D3 BaseDatos: obtenerConductoresDisponibles(fecha: Date): List
    async findDisponibles() {
        return prisma.conductor.findMany({
            where: { estado: EstadoConductor.ACTIVO },
            orderBy: { nombreCompleto: 'asc' },
        })
    }

    async findByID(conductorID: string) {
        return prisma.conductor.findUnique({
            where: { conductorID },
            include: {
                asignaciones: {
                    include: { horario: { include: { ruta: true } } },
                    orderBy: { fechaAsignacion: 'desc' },
                    take: 10,
                },
                horarios: {
                    include: { ruta: true },
                    orderBy: { fechaInicio: 'desc' },
                    take: 5,
                },
            },
        })
    }

    // D3 BaseDatos: guardarConductor(cond: Conductor): boolean
    async save(datos: {
        conductorID: string
        nombreCompleto: string
        curp: string
        numeroLicencia: string
        vigenciaLicencia: Date
        domicilio?: string
        numeroTelefonico?: string
    }) {
        return prisma.conductor.create({ data: datos })
    }

    // D3 BaseDatos: guardarCambios(cond: Conductor): boolean
    async update(conductorID: string, datos: {
        nombreCompleto?: string
        domicilio?: string
        numeroTelefonico?: string
        vigenciaLicencia?: Date
    }) {
        return prisma.conductor.update({ where: { conductorID }, data: datos })
    }

    // D5: cambiarEstado — respeta reglas del diagrama de estados
    async cambiarEstado(conductorID: string, estado: EstadoConductor, motivo?: string) {
        return prisma.conductor.update({
            where: { conductorID },
            data: {
                estado,
                motivoBaja: motivo ?? null,
                disponible: estado === EstadoConductor.ACTIVO,
            },
        })
    }

    // D3 BaseDatos: verificarDuplicidad(CURP: String, licencia: String): boolean
    async verificarDuplicidad(curp: string, numeroLicencia: string, excludeID?: string) {
        const where = {
            OR: [
                { curp },
                { numeroLicencia },
            ],
            ...(excludeID ? { NOT: { conductorID: excludeID } } : {}),
        }
        const existente = await prisma.conductor.findFirst({ where })
        return existente !== null
    }

    async contarPorEstado() {
        return prisma.conductor.groupBy({
            by: ['estado'],
            _count: { conductorID: true },
        })
    }
}
