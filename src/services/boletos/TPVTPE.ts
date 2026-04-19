// D5 CU4 — Sistema externo de terminal de pago; integrado por ProcesadorPago
// Discrepancia D5: TPV y TPE son dispositivos distintos en hardware real; el diagrama los unifica
export class TPVTPE {
    // D5: procesa el cobro en la terminal física
    cobrar(monto: number): boolean { return false }

    // D5: cancela/revierte una transacción previa en la terminal
    cancelarTransaccion(idTransaccion: string): void {}
}
