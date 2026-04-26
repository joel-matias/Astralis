import { prisma } from '@/lib/prisma'
import { TipoMantenimiento } from '@prisma/client'

// D8: RepoMtto — Repositorio Mantenimiento
export class RepositorioMantenimiento {

    async findByAutobus(autobusID: string) {
        return prisma.mantenimiento.findMany({
            where: { autobusID },
            orderBy: { fechaInicio: 'desc' },
        })
    }

    async findAbiertoPorAutobus(autobusID: string) {
        return prisma.mantenimiento.findFirst({
            where: { autobusID, estaAbierto: true },
        })
    }

    async findByID(mantenimientoID: string) {
        return prisma.mantenimiento.findUnique({
            where: { mantenimientoID },
            include: { autobus: true },
        })
    }

    async contarPorTipo() {
        return prisma.mantenimiento.groupBy({
            by: ['tipo'],
            _count: { mantenimientoID: true },
            where: { estaAbierto: true },
        })
    }

    async findTodos(filtros?: { tipo?: TipoMantenimiento; abierto?: boolean }) {
        return prisma.mantenimiento.findMany({
            where: {
                ...(filtros?.tipo !== undefined ? { tipo: filtros.tipo } : {}),
                ...(filtros?.abierto !== undefined ? { estaAbierto: filtros.abierto } : {}),
            },
            include: { autobus: true },
            orderBy: { fechaInicio: 'desc' },
        })
    }
}
