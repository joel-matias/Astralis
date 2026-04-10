export class ProcesadorPago {
    private metodoPago: string

    constructor(metodoPago: string) {
        this.metodoPago = metodoPago
    }

    getMetodoPago(): string { return this.metodoPago }

    procesarTPV(monto: number): boolean {
        // Integración real con el servicio TPV externo
        void monto
        return true
    }

    procesarEfectivo(recibido: number): number {
        // El monto de la venta debe haberse calculado previamente
        void recibido
        return 0
    }

    revertirEnError(): void {
        // MapaAsientos.liberarReserva() + revertir cargo TPV si aplica
    }
}
