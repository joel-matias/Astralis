// D9 CU4 — Contrato que debe implementar EmisordeBoletos para comunicarse con GestorVentas
export interface IEmision {
    generarBoletos(cantidad: number, qrUnico: string): void
    generarQR(): string
    imprimir(cantidad: number): void
    guardarDigital(): void
    enviarEmail(dest: string): void
}
