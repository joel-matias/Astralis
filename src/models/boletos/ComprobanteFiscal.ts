// D2 CU4 — Generado al completar una venta; métodos renombrados respecto a D1
export class ComprobanteFiscal {
    // D1: folio, fecha (DateTime), montoTotal (Double→number)
    private folio: string
    private fecha: Date
    private montoTotal: number

    constructor(folio: string, fecha: Date, montoTotal: number) {
        this.folio = folio
        this.fecha = fecha
        this.montoTotal = montoTotal
    }

    getFolio(): string { return this.folio }
    getFecha(): Date { return this.fecha }
    getMontoTotal(): number { return this.montoTotal }

    // D2: generarComprobanteSAT() y imprimirComprobante() — stubs; integración SAT/impresora fuera del alcance
    generarComprobanteSAT(): void {}
    imprimirComprobante(): void {}
}
