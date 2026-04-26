import { prisma } from '@/lib/prisma'

// D8: RepoAud — Repositorio Auditoría (módulo flota)
export class RepositorioAuditoria {

    async findByModulo(limite = 50) {
        return prisma.logAuditoria.findMany({
            where: { modulo: 'flota' },
            orderBy: { fechaHora: 'desc' },
            take: limite,
        })
    }

    async findByAutobus(textoDetalle: string) {
        return prisma.logAuditoria.findMany({
            where: {
                modulo: 'flota',
                detalles: { contains: textoDetalle },
            },
            orderBy: { fechaHora: 'desc' },
        })
    }
}
