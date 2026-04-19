// D8 CU4 — paquete Emision; genera código QR único por boleto
export class GeneradorQR {
    generar(idBoleto: string): string {
        return `QR-${idBoleto.replace(/-/g, '')}`
    }

    validar(codigoQR: string): boolean {
        return codigoQR.startsWith('QR-') && codigoQR.length > 10
    }
}
