import { prisma } from '@/lib/prisma'

// D8: NegAud — Servicio Auditoría para el módulo Gestión de Flota
export class AuditoriaService {

    // D4, D5 — registra una acción en log_auditoria
    async registrarEvento(usuario: string, accion: string, detalle: string): Promise<void> {
        await prisma.logAuditoria.create({
            data: {
                accion,
                modulo: 'flota',
                resultado: 'Exito',
                detalles: `${detalle} | usuario: ${usuario}`,
            },
        })
    }

    async registrarError(usuario: string, accion: string, detalle: string): Promise<void> {
        await prisma.logAuditoria.create({
            data: {
                accion,
                modulo: 'flota',
                resultado: 'Fallo',
                detalles: `${detalle} | usuario: ${usuario}`,
            },
        })
    }
}
