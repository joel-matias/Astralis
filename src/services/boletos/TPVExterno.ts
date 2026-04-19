// D8 CU4 — paquete Infraestructura; sistema externo de terminal de pago (TPVTPE en D5 → TPVExterno en D8)
export class TPVExterno {
    cobrar(monto: number): boolean { return false }
    cancelarTransaccion(idTransaccion: string): void {}
    verificarConexion(): boolean { return false }
}
