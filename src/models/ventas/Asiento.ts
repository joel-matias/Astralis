/**
 * CU4 — Venta de Boletos (POS)
 * Clase: Asiento
 *
 * Responsabilidades (diagrama):
 * - Indicar disponibilidad del asiento
 * - Reservarse temporalmente al ser seleccionado (5 min)
 * - Marcarse como ocupado al confirmar la venta
 * - Liberarse si el pago falla o el tiempo expira
 *
 * Pertenece a: Viaje (1..*)
 */

export class Asiento {
    private numero: string
    private disponible: boolean
    private reservadoHasta: Date | null

    constructor(
        numero: string,
        disponible: boolean = true,
        reservadoHasta: Date | null = null
    ) {
        this.numero = numero
        this.disponible = disponible
        this.reservadoHasta = reservadoHasta
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getNumero(): string { return this.numero }
    isDisponible(): boolean { return this.disponible }
    getReservadoHasta(): Date | null { return this.reservadoHasta }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Reserva el asiento temporalmente (bloqueo de 5 minutos por defecto).
     * Diagrama: + reservar() : void
     */
    reservar(minutos: number = 5): void {
        this.disponible = false
        this.reservadoHasta = new Date(Date.now() + minutos * 60_000)
    }

    /**
     * Marca el asiento como ocupado definitivamente tras el pago aprobado.
     * Diagrama: + marcarOcupado() : void
     */
    marcarOcupado(): void {
        this.disponible = false
        this.reservadoHasta = null
    }

    /**
     * Libera el asiento si el pago falló o la reserva temporal expiró.
     * Diagrama: + liberarReserva() : void
     */
    liberarReserva(): void {
        this.disponible = true
        this.reservadoHasta = null
    }

    /**
     * Verifica si el asiento tiene una reserva vigente.
     */
    tieneReservaVigente(): boolean {
        return !this.disponible && this.reservadoHasta !== null && this.reservadoHasta > new Date()
    }
}
