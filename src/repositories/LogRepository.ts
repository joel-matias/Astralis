import { prisma } from '@/lib/prisma'
import { LogAuditoria } from '@/models/seguridad/LogAuditoria'

// repository::seguridad — gestiona la persistencia de LogAuditoria en BD
export class LogRepository {

    async save(log: LogAuditoria, modulo: string, ip?: string): Promise<void> {
        await prisma.logAuditoria.create({
            data: {
                logID:      log.getLogID(),
                usuarioID:  log.getUsuarioID() ?? undefined,
                accion:     log.getAccion(),
                modulo,
                resultado:  log.getResultado(),
                detalles:   log.getDetalles() ?? undefined,
                ipOrigen:   ip,
                fechaHora:  log.getFechaHora(),
            },
        })
    }

    // Consulta logs filtrando por rango de fechas
    async query(desde: Date, hasta: Date): Promise<LogAuditoria[]> {
        const registros = await prisma.logAuditoria.findMany({
            where: { fechaHora: { gte: desde, lte: hasta } },
            orderBy: { fechaHora: 'desc' },
        })

        return registros.map(r => new LogAuditoria(
            r.logID,
            r.usuarioID ?? null,
            r.accion,
            r.fechaHora,
            r.resultado,
            r.detalles ?? ''
        ))
    }
}
