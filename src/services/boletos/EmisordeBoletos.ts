// D7 CU4 — Emisión de boletos; generarBoletos() añadido como coordinador según D7
export class EmisordeBoletos {
    // D7: coordina generación de QR e impresión para N boletos; alt E4 — falla impresora → guardarDigital
    generarBoletos(cantidad: number, qrUnico: string): void {}

    // D4: genera código QR único para un boleto individual
    generarQR(): string { return '' }

    // D7 alt E4 [impresion exitosa]: imprime los boletos físicos
    imprimir(cantidad: number): void {}

    // D7 alt E4 [falla impresora]: guarda en formato digital como fallback
    guardarDigital(): void {}

    // D4: envía confirmación por email al destinatario
    enviarEmail(dest: string): void {}
}
