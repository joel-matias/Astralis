/**
 * CU4 — Venta de Boletos (POS)
 * Clase: LogVentas
 *
 * Responsabilidades (diagrama):
 * - Registrar cada transacción de venta con timestamp y usuario
 *
 * Genera: VendedorTaquilla (1 registra N)
 */

export class LogVentas {
    private timestamp: Date
    private usuario: string
    private accion: string

    constructor(usuario: string, accion: string, timestamp: Date = new Date()) {
        this.timestamp = timestamp
        this.usuario = usuario
        this.accion = accion
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getTimestamp(): Date { return this.timestamp }
    getUsuario(): string { return this.usuario }
    getAccion(): string { return this.accion }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Persiste el registro de venta en la base de datos.
     * Diagrama: + registrar() : void
     */
    registrar(): void {
        // LogRepository.save(this)
    }
}
