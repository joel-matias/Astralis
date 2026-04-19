// D2 CU4 — Gestiona pago TPV, validación y reserva de asientos; métodos actualizados respecto a D1
export class SistemaPago {
    // D1: idTransaccion, metodoPago
    private idTransaccion: string
    private metodoPago: string

    constructor(idTransaccion: string, metodoPago: string) {
        this.idTransaccion = idTransaccion
        this.metodoPago = metodoPago
    }

    getIdTransaccion(): string { return this.idTransaccion }
    getMetodoPago(): string { return this.metodoPago }

    // D2: responsabilidades de pago — stubs; integración con TPV real fuera del alcance del CU
    procesarPagoTPV(): void {}
    validarTransaccion(): void {}
    calcularCambioEfectivo(): void {}
    mantenerReservaAsientos(): void {}
}
