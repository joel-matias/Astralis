export class LogAuditoria {
    private logID: string
    private usuarioID: string | null // null cuando el intento fue de un usuario inexistente
    private accion: string
    private fechaHora: Date
    private resultado: string
    private detalles: string

    constructor(
        logID: string,
        usuarioID: string | null,
        accion: string,
        fechaHora: Date,
        resultado: string,
        detalles: string
    ) {
        this.logID = logID
        this.usuarioID = usuarioID
        this.accion = accion
        this.fechaHora = fechaHora
        this.resultado = resultado
        this.detalles = detalles
    }

    getLogID(): string { return this.logID }
    getUsuarioID(): string | null { return this.usuarioID }
    getAccion(): string { return this.accion }
    getFechaHora(): Date { return this.fechaHora }
    getResultado(): string { return this.resultado }
    getDetalles(): string { return this.detalles }

    // Actualiza accion y resultado en la instancia antes de persistir en BD
    registrarAcceso(accion: string, resultado: string): void {
        this.accion = accion
        this.resultado = resultado
    }

    static buscarPorFecha(
        logs: LogAuditoria[],
        desde: Date,
        hasta: Date
    ): LogAuditoria[] {
        return logs.filter(l => l.fechaHora >= desde && l.fechaHora <= hasta)
    }

    static buscarPorUsuario(logs: LogAuditoria[], usuarioID: string): LogAuditoria[] {
        return logs.filter(l => l.usuarioID === usuarioID)
    }

    // El diagrama indica File como tipo de retorno; en Node.js se representa como string
    // El formato esperado es 'json' o 'csv'
    exportarLog(formato: string): string {
        const data = {
            logID: this.logID,
            usuarioID: this.usuarioID,
            accion: this.accion,
            fechaHora: this.fechaHora.toISOString(),
            resultado: this.resultado,
            detalles: this.detalles,
        }
        if (formato === 'csv') {
            return Object.values(data).join(',')
        }
        return JSON.stringify(data, null, 2)
    }
}
