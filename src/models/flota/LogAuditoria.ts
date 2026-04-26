// D1, D4, D5 — LogAuditoria: registra todas las acciones del módulo Gestión de Flota
export class LogAuditoria {
    private idLog: number              // D4: int
    private fechaHora: Date            // D4: DateTime
    private usuario: string            // D4: String
    private accion: string             // D4: String
    private detalle: string            // D4: String

    constructor(
        idLog: number,
        usuario: string,
        accion: string,
        detalle: string,
        fechaHora: Date = new Date()
    ) {
        this.idLog = idLog
        this.fechaHora = fechaHora
        this.usuario = usuario
        this.accion = accion
        this.detalle = detalle
    }

    getIdLog(): number { return this.idLog }
    getFechaHora(): Date { return this.fechaHora }
    getUsuario(): string { return this.usuario }
    getAccion(): string { return this.accion }
    getDetalle(): string { return this.detalle }

    // D4, D5 — registra una acción del sistema con su contexto
    registrar(usuario: string, accion: string, detalle: string): void {
        this.usuario = usuario
        this.accion = accion
        this.detalle = detalle
        this.fechaHora = new Date()
    }
}
