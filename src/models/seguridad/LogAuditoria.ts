export type ResultadoAuditoria = 'Exito' | 'Fallo' | 'Bloqueado'

export class LogAuditoria {
    private logID: string
    private usuarioID: string | null
    private accion: string
    private modulo: string
    private fechaHora: Date
    private resultado: ResultadoAuditoria
    private detalles: string | null

    constructor(
        logID: string,
        accion: string,
        modulo: string,
        resultado: ResultadoAuditoria,
        usuarioID: string | null = null,
        detalles: string | null = null,
        fechaHora: Date = new Date()
    ) {
        this.logID = logID
        this.usuarioID = usuarioID
        this.accion = accion
        this.modulo = modulo
        this.fechaHora = fechaHora
        this.resultado = resultado
        this.detalles = detalles
    }

    getLogID(): string { return this.logID }
    getUsuarioID(): string | null { return this.usuarioID }
    getAccion(): string { return this.accion }
    getModulo(): string { return this.modulo }
    getFechaHora(): Date { return this.fechaHora }
    getResultado(): ResultadoAuditoria { return this.resultado }
    getDetalles(): string | null { return this.detalles }

    // La persistencia real se delega al repositorio/servicio de auditoría
    registrar(): void {}

    static buscarPorFecha(
        logs: LogAuditoria[],
        desde: Date,
        hasta: Date
    ): LogAuditoria[] {
        return logs.filter(
            (l) => l.fechaHora >= desde && l.fechaHora <= hasta
        )
    }

    static buscarPorUsuario(
        logs: LogAuditoria[],
        usuarioID: string
    ): LogAuditoria[] {
        return logs.filter((l) => l.usuarioID === usuarioID)
    }

    exportar(formato: 'json' | 'csv'): string {
        const data = {
            logID: this.logID,
            usuarioID: this.usuarioID,
            accion: this.accion,
            modulo: this.modulo,
            fechaHora: this.fechaHora.toISOString(),
            resultado: this.resultado,
            detalles: this.detalles,
        }
        if (formato === 'json') return JSON.stringify(data, null, 2)
        return Object.values(data).join(',')
    }
}
