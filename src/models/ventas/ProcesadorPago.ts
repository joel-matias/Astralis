/**
 * CU4 — Venta de Boletos (POS)
 * Clase: ProcesadorPago
 *
 * Responsabilidades (diagrama):
 * - Procesar pago con terminal TPV
 * - Calcular cambio para pago en efectivo
 * - Revertir reserva de asientos si el pago falla
 *
 * Integra: TPV/TPE externo
 * Depende de: ModuloPOS
 */

export class ProcesadorPago {
    private metodoPago: string

    constructor(metodoPago: string) {
        this.metodoPago = metodoPago
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getMetodoPago(): string { return this.metodoPago }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Procesa el cobro mediante terminal bancaria (TPV).
     * Diagrama: + procesarTPV(monto: Double) : Boolean
     */
    procesarTPV(monto: number): boolean {
        // Integración real con el servicio TPV externo
        void monto
        return true
    }

    /**
     * Calcula el cambio para pago en efectivo y retorna el monto.
     * Diagrama: + procesarEfectivo(recibido: Double) : Double
     */
    procesarEfectivo(recibido: number): number {
        // El monto de la venta debe haberse calculado previamente
        void recibido
        return 0
    }

    /**
     * Revierte la transacción y libera la reserva de asientos en caso de error.
     * Diagrama: + revertirEnError() : void
     */
    revertirEnError(): void {
        // MapaAsientos.liberarReserva() + revertir cargo TPV si aplica
    }
}
