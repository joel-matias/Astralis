/**
 * CU7 — Control de Andenes
 * Clase: Supervisor
 *
 * Responsabilidades (diagrama):
 * - Solicitar asignación de andén
 * - Seleccionar autobús disponible
 * - Seleccionar andén disponible
 * - Confirmar o cancelar la asignación
 *
 * Realiza: Asignacion (0..*)
 */

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

    // ── Getters ──────────────────────────────────────────────────────────────
    getSupervisorID(): string { return this.supervisorID }
    getNombre(): string { return this.nombre }
    getUsuario(): string { return this.usuario }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Autentica al supervisor en el sistema de andenes.
     * Diagrama: + login() : Boolean
     */
    login(): boolean {
        return this.usuario.length > 0 && this.contrasena.length > 0
    }

    /**
     * Solicita el inicio del flujo de asignación de andén.
     * Diagrama: + solicitarAsignacion() : void
     */
    solicitarAsignacion(): void {
        // Inicia el flujo en ControladorAsignacion
    }

    /**
     * Cancela la asignación en progreso.
     * Diagrama: + cancelarAsignacion() : void
     */
    cancelarAsignacion(): void {
        // Llama Asignacion.cancelar() y LogAuditoria.registrarCancelacion()
    }

    /**
     * Confirma la asignación guardada.
     * Diagrama: + confirmarAsignacion() : void
     */
    confirmarAsignacion(): void {
        // Llama Asignacion.guardar() y actualiza estado del Andén
    }
}
