// D8 CU4 — paquete Pagos; procesa pagos con tarjeta vía TPV (ProcesadorPago de D4 dividido en D8)
export class ProcesadorTPV {
    procesarPago(monto: number): boolean { return false }
    revertirPago(idTransaccion: string): void {}
}
