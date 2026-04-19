// Registra cada operación sobre rutas — ControladorRutas lo instancia y llama registrar() al finalizar
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

    // Actualiza la acción y resultado en la instancia; la persistencia real la hace RepositorioRutas.registrarLog()
    registrar(accion: string, resultado: string): void {
        this.accion = accion
        this.resultado = resultado
    }

    // La consulta real por ruta la ejecuta LogRepository — este stub existe para cumplir el contrato del diagrama
    buscarPorRuta(id: string): LogAuditoria[] {
        void id
        return []
    }
}
