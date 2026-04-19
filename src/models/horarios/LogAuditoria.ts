// D1 CU3 — Registro de auditoría para operaciones del módulo de horarios
export class LogAuditoria {
    private logID: string
    private usuarioID: string
    private accion: string
    private fechaHora: Date
    private resultado: string

    constructor(
        logID: string,
        usuarioID: string,
        accion: string,
        fechaHora: Date,
        resultado: string
    ) {
        this.logID = logID
        this.usuarioID = usuarioID
        this.accion = accion
        this.fechaHora = fechaHora
        this.resultado = resultado
    }

    getLogID(): string { return this.logID }
    getUsuarioID(): string { return this.usuarioID }
    getAccion(): string { return this.accion }
    getFechaHora(): Date { return this.fechaHora }
    getResultado(): string { return this.resultado }

    registrar(accion: string, resultado: string): void {
        this.accion = accion
        this.resultado = resultado
    }

    // D4: stub — la consulta real la ejecuta LogRepository filtrando por horarioID en BD
    buscarPorHorario(id: string): LogAuditoria[] {
        void id
        return []
    }
}
