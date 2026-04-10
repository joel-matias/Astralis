export class ComprobanteFiscal {
    private folio: string
    private fecha: Date
    private montoTotal: number

    constructor(folio: string, montoTotal: number, fecha: Date = new Date()) {
        this.folio = folio
        this.fecha = fecha
        this.montoTotal = montoTotal
    }

    getFolio(): string { return this.folio }
    getFecha(): Date { return this.fecha }
    getMontoTotal(): number { return this.montoTotal }

    generar(): void {
        // GestorFiscal.generarComprobanteSAT(this)
    }

    imprimir(): void {
        // GestorFiscal.imprimirComprobante(this)
    }
}
