// D7 CU4 — Registro de auditoría; registrar() recibe parámetros explícitos según D7 (D1 tenía registrar(): void)
export class LogVentas {
    // D1: timestamp, usuario, transaccion
    private timestamp: Date
    private usuario: string
    private transaccion: string

    constructor(timestamp: Date, usuario: string, transaccion: string) {
        this.timestamp = timestamp
        this.usuario = usuario
        this.transaccion = transaccion
    }

    getTimestamp(): Date { return this.timestamp }
    getUsuario(): string { return this.usuario }
    getTransaccion(): string { return this.transaccion }

    // D7: parámetros explícitos — registrar(transaccion, usuario, timestamp)
    registrar(transaccion: string, usuario: string, timestamp: Date): void {}
}
