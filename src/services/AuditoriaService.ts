import { LogAuditoria } from '@/models/seguridad/LogAuditoria'
import { LogRepository } from '@/repositories/LogRepository'

// service::auditoria — centraliza el registro y consulta de eventos de auditoría
export class AuditoriaService {
    private logRepository = new LogRepository()

    // Crea y persiste un evento de auditoría
    async registrarEvento(
        usuarioID: string | null,
        accion: string,
        resultado: string,
        modulo: string,
        detalles = '',
        ip?: string
    ): Promise<void> {
        const log = new LogAuditoria(
            crypto.randomUUID(),
            usuarioID,
            accion,
            new Date(),
            resultado,
            detalles
        )
        log.registrarAcceso(accion, resultado)
        await this.logRepository.save(log, modulo, ip)
    }

    // Retorna logs dentro de un rango de fechas
    async buscarPorFecha(desde: Date, hasta: Date): Promise<LogAuditoria[]> {
        return this.logRepository.query(desde, hasta)
    }

    // Exporta los logs de un rango como string — el diagrama indica File,
    // en Node.js se representa como string (JSON o CSV)
    async exportarLog(formato: string, desde: Date, hasta: Date): Promise<string> {
        const logs = await this.buscarPorFecha(desde, hasta)
        if (formato === 'csv') {
            const cabecera = 'logID,usuarioID,accion,fechaHora,resultado,detalles'
            const filas = logs.map(l => l.exportarLog('csv'))
            return [cabecera, ...filas].join('\n')
        }
        return JSON.stringify(logs.map(l => l.exportarLog('json')), null, 2)
    }
}
