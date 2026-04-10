export class EncargadoEquipaje {
    private encargadoID: string
    private nombre: string
    private usuario: string

    constructor(encargadoID: string, nombre: string, usuario: string) {
        this.encargadoID = encargadoID
        this.nombre = nombre
        this.usuario = usuario
    }

    getEncargadoID(): string { return this.encargadoID }
    getNombre(): string { return this.nombre }
    getUsuario(): string { return this.usuario }

    login(): boolean {
        return this.usuario.length > 0
    }

    solicitarRegistro(): void {
        // ControladorEquipaje.obtenerViajesActivos()
    }

    cancelarRegistro(): void {
        // Equipaje.cancelar() + LogAuditoria.registrarCancelacion()
    }

    confirmarRegistro(): void {
        // Equipaje.guardar() + LogAuditoria.registrarAccion()
    }
}
