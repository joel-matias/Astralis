export class Supervisor {
    private supervisorID: string
    private nombre: string
    private usuario: string
    private contrasena: string

    constructor(
        supervisorID: string,
        nombre: string,
        usuario: string,
        contrasena: string
    ) {
        this.supervisorID = supervisorID
        this.nombre = nombre
        this.usuario = usuario
        this.contrasena = contrasena
    }

    getSupervisorID(): string { return this.supervisorID }
    getNombre(): string { return this.nombre }
    getUsuario(): string { return this.usuario }

    login(): boolean {
        return this.usuario.length > 0 && this.contrasena.length > 0
    }

    solicitarAsignacion(): void {
        // Inicia el flujo en ControladorAsignacion
    }

    cancelarAsignacion(): void {
        // Llama Asignacion.cancelar() y LogAuditoria.registrarCancelacion()
    }

    confirmarAsignacion(): void {
        // Llama Asignacion.guardar() y actualiza estado del Andén
    }
}
