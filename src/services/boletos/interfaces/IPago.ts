// D9 CU4 — Contrato que debe implementar ProcesadorPago para comunicarse con GestorVentas
export interface IPago {
    procesarTPV(monto: number): boolean
    procesarEfectivo(recibido: number): number
    revertirEnError(): void
}
