/**
 * CU4 — Venta de Boletos (POS)
 * Clase: VendedorTaquilla
 *
 * Responsabilidades (diagrama):
 * - Acceder al módulo POS
 * - Buscar viajes disponibles
 * - Seleccionar viaje y asientos
 * - Solicitar forma de pago
 * - Entregar boletos y comprobante
 *
 * Usa: ModuloPOS
 */

export class VendedorTaquilla {
    private id: string
    private nombre: string
    private turno: string

    constructor(id: string, nombre: string, turno: string) {
        this.id = id
        this.nombre = nombre
        this.turno = turno
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getId(): string { return this.id }
    getNombre(): string { return this.nombre }
    getTurno(): string { return this.turno }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Inicia sesión en el sistema POS.
     * Diagrama: + iniciarSesion() : Boolean
     */
    iniciarSesion(): boolean {
        return this.id.length > 0 && this.turno.length > 0
    }

    /**
     * Selecciona el viaje del que se venderán boletos.
     * Diagrama: + seleccionarViaje() : void
     */
    seleccionarViaje(): void {
        // Delega a ModuloPOS.mostrarBuscador()
    }

    /**
     * Inicia el flujo de procesamiento de la venta.
     * Diagrama: + procesarVenta() : void
     */
    procesarVenta(): void {
        // Delega a ModuloPOS.confirmarVenta()
    }

    /**
     * Entrega los boletos impresos y el comprobante fiscal al cliente.
     * Diagrama: + entregarBoleto() : void
     */
    entregarBoleto(): void {
        // Delega a EmisorBoletos y GestorFiscal
    }
}
