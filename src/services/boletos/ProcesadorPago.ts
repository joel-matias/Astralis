// D4 CU4 — Maneja TPV, efectivo y reversión; renombrado de SistemaPago (D1/D2/D3) en capa de servicios
export class ProcesadorPago {
    // D4: método de pago seleccionado por el vendedor
    metodoPago: string = ''

    // D4: procesa pago por TPV; retorna true si aprobado (Double→number)
    procesarTPV(monto: number): boolean { return false }

    // D4: procesa pago en efectivo y retorna el cambio (Double→number)
    procesarEfectivo(recibido: number): number { return 0 }

    // D4: revierte la transacción y libera la reserva de asientos en caso de error
    revertirEnError(): void {}
}
