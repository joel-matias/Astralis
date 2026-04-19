// D8 CU4 — paquete Pagos; procesa pagos en efectivo y calcula cambio (ProcesadorPago de D4 dividido en D8)
export class ProcesadorEfectivo {
    procesarPago(montoRecibido: number, totalVenta: number): number { return montoRecibido - totalVenta }
    calcularCambio(montoRecibido: number, totalVenta: number): number { return montoRecibido - totalVenta }
}
