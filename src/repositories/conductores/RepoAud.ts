// D7 CU6 — RepoAud: Repositorio Auditoría del módulo Administración de Conductores
import { prisma } from '@/lib/prisma'

export class RepoAud {

    async save(datos: {
        usuarioID?: string
        accion: string
        resultado: string
        detalles?: string
    }) {
        return prisma.logAuditoria.create({
            data: {
                ...datos,
                modulo: 'CONDUCTORES',
            },
        })
    }

    async findByConductor(conductorID: string) {
        return prisma.logAuditoria.findMany({
            where: {
                modulo: 'CONDUCTORES',
                detalles: { contains: conductorID },
            },
            orderBy: { fechaHora: 'desc' },
            take: 50,
        })
    }
}
