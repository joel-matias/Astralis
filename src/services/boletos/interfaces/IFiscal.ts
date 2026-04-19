// D9 CU4 — Contrato que debe implementar GestorFiscal para comunicarse con GestorVentas
export interface IFiscal {
    generarComprobanteFiscal(): void
    imprimir(): void
}
