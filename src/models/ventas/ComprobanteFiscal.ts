/**
 * CU4 — Venta de Boletos (POS)
 * Clase: ComprobanteFiscal
 *
 * Responsabilidades (diagrama):
 * - Generar comprobante SAT de la venta
 * - Imprimir el comprobante al cliente
 *
 * Generado por: Boleto (1 genera 1)
 */

export class ComprobanteFiscal {
    private folio: string
    private fecha: Date
    private montoTotal: number

    constructor(folio: string, montoTotal: number, fecha: Date = new Date()) {
        this.folio = folio
        this.fecha = fecha
        this.montoTotal = montoTotal
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getFolio(): string { return this.folio }
    getFecha(): Date { return this.fecha }
    getMontoTotal(): number { return this.montoTotal }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Genera el comprobante fiscal (timbrado SAT).
     * Diagrama: + generar() : void
     * La integración real con el SAT se delega a GestorFiscal.
     */
    generar(): void {
        // GestorFiscal.generarComprobanteSAT(this)
    }

    /**
     * Imprime el comprobante en la impresora térmica del POS.
     * Diagrama: + imprimir() : void
     */
    imprimir(): void {
        // GestorFiscal.imprimirComprobante(this)
    }
}
