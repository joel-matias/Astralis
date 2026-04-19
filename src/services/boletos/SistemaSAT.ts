// D9 CU4 — Sistema externo del SAT; usado por GestorFiscal para timbrado fiscal; no aparece en diagramas anteriores
export class SistemaSAT {
    timbrarComprobante(datos: Record<string, unknown>): string { return '' }
    verificarConexion(): boolean { return false }
}
