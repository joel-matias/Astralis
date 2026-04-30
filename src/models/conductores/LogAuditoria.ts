// D2, D3 CU6 — Registro de auditoría para operaciones del módulo Administración de Conductores
export class LogAuditoria {
    // D3: idLog: int → String (UUID) en código
    private idLog: string
    private fechaHora: Date
    private usuario: string
    private accion: string
    private detalle: string

    constructor(
        idLog: string,
        fechaHora: Date,
        usuario: string,
        accion: string,
        detalle: string
    ) {
        this.idLog = idLog
        this.fechaHora = fechaHora
        this.usuario = usuario
        this.accion = accion
        this.detalle = detalle
    }

    getIdLog(): string { return this.idLog }
    getFechaHora(): Date { return this.fechaHora }
    getUsuario(): string { return this.usuario }
    getAccion(): string { return this.accion }
    getDetalle(): string { return this.detalle }

    // D3: registrar(usuario: String, accion: String, detalle: String): void
    registrar(usuario: string, accion: string, detalle: string): void {
        this.usuario = usuario
        this.accion = accion
        this.detalle = detalle
        this.fechaHora = new Date()
    }
}
