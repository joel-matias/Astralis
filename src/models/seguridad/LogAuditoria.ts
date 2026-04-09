/**
 * CU1 — Seguridad y Autenticación
 * Clase: LogAuditoria
 *
 * Responsabilidades (diagrama):
 * - Registrar cada intento de inicio de sesión
 * - Guardar resultado (Éxito / Fallo / Bloqueado)
 * - Registrar bloqueo y notificar administrador
 * - Proveer trazabilidad de accesos para auditoría
 * - Registrar cierre de sesión del usuario
 *
 * Colabora con: Usuario, SesionActiva
 * Persiste en BD
 */

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

    // ── Getters ──────────────────────────────────────────────────────────────
    getLogID(): string { return this.logID }
    getUsuarioID(): string | null { return this.usuarioID }
    getAccion(): string { return this.accion }
    getModulo(): string { return this.modulo }
    getFechaHora(): Date { return this.fechaHora }
    getResultado(): ResultadoAuditoria { return this.resultado }
    getDetalles(): string | null { return this.detalles }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Registra la acción en el log.
     * Diagrama: + registrar() : void
     * La persistencia real se delega al repositorio/servicio de auditoría.
     */
    registrar(): void {
        // La instancia ya contiene los datos; el repositorio persiste este objeto.
        // Ver: AuditoriaService.registrar(log: LogAuditoria)
    }

    /**
     * Filtra logs por fecha.
     * Diagrama: + buscarPorFecha() : List
     * Operación de consulta — implementada en AuditoriaService.
     */
    static buscarPorFecha(
        logs: LogAuditoria[],
        desde: Date,
        hasta: Date
    ): LogAuditoria[] {
        return logs.filter(
            (l) => l.fechaHora >= desde && l.fechaHora <= hasta
        )
    }

    /**
     * Filtra logs por usuarioID.
     * Diagrama: + buscarPorUsuario(usuarioID: String) : List
     */
    static buscarPorUsuario(
        logs: LogAuditoria[],
        usuarioID: string
    ): LogAuditoria[] {
        return logs.filter((l) => l.usuarioID === usuarioID)
    }

    /**
     * Exporta los logs en el formato indicado.
     * Diagrama: + exportar(formato: String) : File
     * La generación del archivo se delega al servicio de auditoría.
     */
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
