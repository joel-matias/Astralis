import { prisma } from '@/lib/prisma'
import { EstadoAutobus, TipoServicio } from '@prisma/client'

// D8: RepoBus — Repositorio Autobús
export class RepositorioAutobus {

    private buildWhere(filtros?: { estado?: EstadoAutobus; tipo?: TipoServicio; q?: string }) {
        return {
            ...(filtros?.estado ? { estadoOperativo: filtros.estado } : {}),
            ...(filtros?.tipo ? { tipoServicio: filtros.tipo } : {}),
            ...(filtros?.q ? {
                OR: [
                    { numeroEconomico: { contains: filtros.q } },
                    { placas: { contains: filtros.q } },
                    { marca: { contains: filtros.q } },
                    { modelo: { contains: filtros.q } },
                ],
            } : {}),
        }
    }

    async findAll(filtros?: { estado?: EstadoAutobus; tipo?: TipoServicio; q?: string }, pagina?: { skip: number; take: number }) {
        return prisma.autobus.findMany({
            where: this.buildWhere(filtros),
            include: { mantenimientos: { where: { estaAbierto: true }, take: 1 } },
            orderBy: { numeroEconomico: 'asc' },
            ...(pagina ?? {}),
        })
    }

    async count(filtros?: { estado?: EstadoAutobus; tipo?: TipoServicio; q?: string }) {
        return prisma.autobus.count({ where: this.buildWhere(filtros) })
    }

    async findByID(autobusID: string) {
        return prisma.autobus.findUnique({
            where: { autobusID },
            include: {
                mantenimientos: { orderBy: { fechaInicio: 'desc' } },
                asignaciones: {
                    where: { liberado: false },
                    include: { horario: { include: { ruta: true } }, conductor: true },
                    take: 1,
                },
                _count: { select: { asientos: true } },
            },
        })
    }

    async findByNumeroEconomico(numeroEconomico: string) {
        return prisma.autobus.findUnique({ where: { numeroEconomico } })
    }

    async contarPorEstado() {
        return prisma.autobus.groupBy({
            by: ['estadoOperativo'],
            _count: { autobusID: true },
        })
    }
}
