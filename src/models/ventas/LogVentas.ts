export class LogVentas {
    private timestamp: Date
    private usuario: string
    private accion: string

    constructor(usuario: string, accion: string, timestamp: Date = new Date()) {
        this.timestamp = timestamp
        this.usuario = usuario
        this.accion = accion
    }

    getTimestamp(): Date { return this.timestamp }
    getUsuario(): string { return this.usuario }
    getAccion(): string { return this.accion }

    registrar(): void {
        // LogRepository.save(this)
    }
}
